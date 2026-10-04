// This file has ONE job: visit a single website and record whether it's up or down.
// It doesn't decide WHEN to run - that scheduling logic lives in jobs/checkerJob.js.
// As of Phase 5, it also decides WHETHER to send an email, based on
// whether the site just changed state (not on every repeated failure).

const axios = require("axios");
const prisma = require("../prismaClient");
const { sendDownAlert, sendUpAlert } = require("./mailerService");

// How long we wait for a website to respond before giving up and calling it "down".
const TIMEOUT_MS = 10000;

// Turns a scary technical error into a short, human-readable reason for the email.
function describeError(error) {
  if (error.response) {
    return `The site responded with an error (HTTP ${error.response.status})`;
  }
  switch (error.code) {
    case "ECONNABORTED":
    case "ETIMEDOUT":
      return `No response within ${TIMEOUT_MS / 1000} seconds (timed out)`;
    case "ENOTFOUND":
      return "The domain name could not be found (DNS error)";
    case "ECONNREFUSED":
      return "The server refused the connection";
    case "ECONNRESET":
      return "The connection was reset by the server";
    default:
      return error.message || "Unknown error";
  }
}

async function checkSite(site) {
  const startTime = Date.now();

  // Look up the site's MOST RECENT previous check result, BEFORE we save a new one,
  // so we can tell whether this new result is a CHANGE in status.
  const previousResult = await prisma.checkResult.findFirst({
    where: { siteId: site.id },
    orderBy: { checkedAt: "desc" },
  });
  const previousStatus = previousResult ? previousResult.status : null; // null = very first check ever

  let newStatus;
  let responseTimeMs = null;
  let failureReason = null;

  try {
    await axios.get(site.url, {
      timeout: TIMEOUT_MS,
      headers: { "User-Agent": "PulseCheck-Monitor/1.0" },
    });

    responseTimeMs = Date.now() - startTime;
    newStatus = "up";

    console.log(`[checker] ${site.name} (${site.url}) is UP - ${responseTimeMs}ms`);
  } catch (error) {
    newStatus = "down";
    failureReason = describeError(error);

    console.log(`[checker] ${site.name} (${site.url}) is DOWN - ${error.message}`);
  }

  // The state-change rules (unchanged): email only when the status actually flips.
  const justWentDown = newStatus === "down" && previousStatus !== "down";
  const justRecovered = newStatus === "up" && previousStatus === "down";

  // For the recovery email we want to say "how long was it down?". To work that out we find
  // when the current outage began: the first "down" check after the last "up" check.
  // This must happen BEFORE we save the new result, so we only look at older history.
  let downtimeMs = null;
  if (justRecovered) {
    const lastUp = await prisma.checkResult.findFirst({
      where: { siteId: site.id, status: "up" },
      orderBy: { checkedAt: "desc" },
    });
    const firstDown = await prisma.checkResult.findFirst({
      where: {
        siteId: site.id,
        status: "down",
        ...(lastUp ? { checkedAt: { gt: lastUp.checkedAt } } : {}),
      },
      orderBy: { checkedAt: "asc" },
    });
    if (firstDown) downtimeMs = Date.now() - firstDown.checkedAt.getTime();
  }

  // Save this check's result, no matter what the outcome was.
  await prisma.checkResult.create({
    data: {
      siteId: site.id,
      status: newStatus,
      responseTimeMs,
    },
  });

  if (justWentDown) {
    try {
      await sendDownAlert(site.user.email, site, {
        reason: failureReason,
        detectedAt: new Date(),
      });
      console.log(`[checker] Down alert emailed to ${site.user.email} for ${site.name}`);
    } catch (emailError) {
      // A failed email must never crash the job - other sites still need checking.
      console.error(`[checker] Failed to send down alert for ${site.name}:`, emailError.message);
    }
  } else if (justRecovered) {
    try {
      await sendUpAlert(site.user.email, site, {
        recoveredAt: new Date(),
        downtimeMs,
      });
      console.log(`[checker] Recovery alert emailed to ${site.user.email} for ${site.name}`);
    } catch (emailError) {
      console.error(`[checker] Failed to send recovery alert for ${site.name}:`, emailError.message);
    }
  }
}

// Runs the check for EVERY monitored website in the database, one batch.
async function checkAllSites() {
  // We "include" the related User record so we know who to email (and their name for the greeting).
  const sites = await prisma.monitoredSite.findMany({
    include: { user: true },
  });

  console.log(`[checker] Running checks for ${sites.length} site(s)...`);

  // Promise.all runs all the checks at the same time instead of one-by-one.
  await Promise.all(sites.map((site) => checkSite(site)));
}

module.exports = { checkSite, checkAllSites };
