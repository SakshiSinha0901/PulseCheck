// This file has ONE job: visit a single website and record whether it's up or down.
// It doesn't decide WHEN to run - that scheduling logic lives in jobs/checkerJob.js.

const axios = require("axios");
const prisma = require("../prismaClient");

// How long we wait for a website to respond before giving up and calling it "down".
// 10 seconds is generous enough for a slow-but-working site, but not so long that
// one broken site slows down checking all the others.
const TIMEOUT_MS = 10000;

async function checkSite(site) {
  const startTime = Date.now(); // a timestamp, in milliseconds, right before we send the request

  try {
    const response = await axios.get(site.url, {
      timeout: TIMEOUT_MS,
      // Some sites reject requests that don't look like they're coming from a real browser.
      // This header just makes our request look a bit more like a normal visitor.
      headers: { "User-Agent": "PulseCheck-Monitor/1.0" },
    });

    const responseTimeMs = Date.now() - startTime; // how long the site took to respond, in milliseconds

    // Anything in the 200-399 range means "the site responded successfully or redirected normally" - counts as UP.
    // axios only lands in this try block for those anyway (it throws for 400+ by default).
    await prisma.checkResult.create({
      data: {
        siteId: site.id,
        status: "up",
        responseTimeMs,
      },
    });

    console.log(`[checker] ${site.name} (${site.url}) is UP - ${responseTimeMs}ms`);
  } catch (error) {
    // We land here if: the site timed out, the site is completely unreachable,
    // or the site responded with an error status (like 404 or 500).
    await prisma.checkResult.create({
      data: {
        siteId: site.id,
        status: "down",
        responseTimeMs: null, // no meaningful response time when it failed
      },
    });

    console.log(`[checker] ${site.name} (${site.url}) is DOWN - ${error.message}`);
  }
}

// Runs the check for EVERY monitored website in the database, one batch.
async function checkAllSites() {
  const sites = await prisma.monitoredSite.findMany();

  console.log(`[checker] Running checks for ${sites.length} site(s)...`);

  // Promise.all runs all the checks at the same time instead of one-by-one,
  // so checking 20 websites doesn't take 20x as long as checking 1.
  await Promise.all(sites.map((site) => checkSite(site)));
}

module.exports = { checkSite, checkAllSites };
