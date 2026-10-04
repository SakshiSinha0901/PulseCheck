// This file's one job: send alert emails (site down / site recovered).
// It knows nothing about cron schedules or databases - it just takes an address
// and some details, and sends a message. Keeping it separate means if we ever
// swap Nodemailer/Gmail for something else later (like SendGrid), only this
// one file needs to change.

const nodemailer = require("nodemailer");

// A "transporter" is nodemailer's term for "the connection settings used to actually
// send mail" - here, Gmail's servers with your Gmail account as the sender.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // this MUST be a Gmail "App Password", not your real password
  },
});

// Site names/URLs are typed in by users. Before putting them inside HTML we "escape"
// special characters (like < and >) so nobody can sneak markup into our emails.
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Turns a number of milliseconds into friendly text, e.g. 754000 -> "12 minutes".
function formatDuration(ms) {
  const totalMinutes = Math.max(1, Math.round(ms / 60000));
  if (totalMinutes < 60) return `${totalMinutes} minute${totalMinutes === 1 ? "" : "s"}`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hourText = `${hours} hour${hours === 1 ? "" : "s"}`;
  return minutes === 0 ? hourText : `${hourText} ${minutes} minute${minutes === 1 ? "" : "s"}`;
}

function formatTime(date) {
  return date.toUTCString(); // e.g. "Sun, 04 Oct 2026 10:15:00 GMT" - unambiguous for any timezone
}

// Shared look for both emails: one clean card, a coloured status bar, a details table, a footer.
function buildHtml({ accent, statusLabel, greeting, intro, rows, closing }) {
  const rowsHtml = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 0; color:#6b7280; width:130px; vertical-align:top;">${label}</td>
          <td style="padding:8px 0; color:#111827;">${value}</td>
        </tr>`
    )
    .join("");

  return `
    <div style="background:#f3f4f6; padding:24px 12px; font-family:Arial, Helvetica, sans-serif;">
      <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #e5e7eb;">
        <div style="background:${accent}; color:#ffffff; padding:14px 24px; font-size:13px; letter-spacing:0.06em; text-transform:uppercase; font-weight:bold;">
          ${statusLabel}
        </div>
        <div style="padding:24px; color:#111827; font-size:15px; line-height:1.6;">
          <p style="margin:0 0 12px;">${greeting}</p>
          <p style="margin:0 0 16px;">${intro}</p>
          <table style="width:100%; border-collapse:collapse; font-size:14px; border-top:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb; margin-bottom:16px;">
            ${rowsHtml}
          </table>
          <p style="margin:0;">${closing}</p>
        </div>
        <div style="padding:16px 24px; background:#f9fafb; color:#6b7280; font-size:12px; line-height:1.5;">
          You are receiving this because this website is monitored in your PulseCheck account.
          We send one email when a site goes down and one when it recovers, not one per check.
        </div>
      </div>
    </div>
  `;
}

// details: { reason: string, detectedAt: Date }
async function sendDownAlert(toEmail, site, details) {
  const name = escapeHtml(site.name);
  const url = escapeHtml(site.url);
  const owner = site.user && site.user.name ? site.user.name : "there";
  const reason = details.reason || "No response received";

  const mailOptions = {
    from: `"PulseCheck" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `[PulseCheck] Alert: ${site.name} is down`,
    text: [
      `Hello ${owner},`,
      ``,
      `PulseCheck was unable to reach "${site.name}". Details:`,
      ``,
      `  Website:  ${site.url}`,
      `  Status:   Down`,
      `  Detected: ${formatTime(details.detectedAt)}`,
      `  Reason:   ${reason}`,
      ``,
      `We will keep checking automatically and let you know as soon as it is back online.`,
      ``,
      `Regards,`,
      `The PulseCheck Team`,
      ``,
      `You are receiving this because this website is monitored in your PulseCheck account.`,
      `We send one email when a site goes down and one when it recovers, not one per check.`,
    ].join("\n"),
    html: buildHtml({
      accent: "#b91c1c",
      statusLabel: "Website down",
      greeting: `Hello ${escapeHtml(owner)},`,
      intro: `PulseCheck was unable to reach <strong>${name}</strong>.`,
      rows: [
        ["Website", `<a href="${url}" style="color:#2563eb;">${url}</a>`],
        ["Status", `<strong style="color:#b91c1c;">Down</strong>`],
        ["Detected at", escapeHtml(formatTime(details.detectedAt))],
        ["Reason", escapeHtml(reason)],
      ],
      closing: `We will keep checking automatically and let you know as soon as it is back online.<br><br>Regards,<br>The PulseCheck Team`,
    }),
  };

  await transporter.sendMail(mailOptions);
}

// details: { recoveredAt: Date, downtimeMs: number | null }
async function sendUpAlert(toEmail, site, details) {
  const name = escapeHtml(site.name);
  const url = escapeHtml(site.url);
  const owner = site.user && site.user.name ? site.user.name : "there";
  const downtimeText = details.downtimeMs != null ? formatDuration(details.downtimeMs) : "Not available";

  const mailOptions = {
    from: `"PulseCheck" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `[PulseCheck] Resolved: ${site.name} is back online`,
    text: [
      `Hello ${owner},`,
      ``,
      `"${site.name}" is responding again. Details:`,
      ``,
      `  Website:    ${site.url}`,
      `  Status:     Up`,
      `  Recovered:  ${formatTime(details.recoveredAt)}`,
      `  Downtime:   approximately ${downtimeText}`,
      ``,
      `No action is needed. We will continue monitoring it as usual.`,
      ``,
      `Regards,`,
      `The PulseCheck Team`,
      ``,
      `You are receiving this because this website is monitored in your PulseCheck account.`,
      `We send one email when a site goes down and one when it recovers, not one per check.`,
    ].join("\n"),
    html: buildHtml({
      accent: "#15803d",
      statusLabel: "Website recovered",
      greeting: `Hello ${escapeHtml(owner)},`,
      intro: `<strong>${name}</strong> is responding again.`,
      rows: [
        ["Website", `<a href="${url}" style="color:#2563eb;">${url}</a>`],
        ["Status", `<strong style="color:#15803d;">Up</strong>`],
        ["Recovered at", escapeHtml(formatTime(details.recoveredAt))],
        ["Downtime", details.downtimeMs != null ? `Approximately ${escapeHtml(downtimeText)}` : "Not available"],
      ],
      closing: `No action is needed. We will continue monitoring it as usual.<br><br>Regards,<br>The PulseCheck Team`,
    }),
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendDownAlert, sendUpAlert };
