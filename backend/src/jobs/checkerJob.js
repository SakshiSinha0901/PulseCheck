// This file decides WHEN the checker runs. It uses node-cron, which works like
// setting a recurring alarm - "run this function every X minutes, forever."

const cron = require("node-cron");
const { checkAllSites } = require("../services/checkerService");

function startCheckerJob() {
  // Cron schedule format is 5 symbols: minute, hour, day-of-month, month, day-of-week.
  // "*/5 * * * *" means "every 5 minutes, every hour, every day" - back to a realistic
  // interval now that we've confirmed the scheduling itself works correctly.
  cron.schedule("*/5 * * * *", () => {
    checkAllSites().catch((error) => {
      console.error("[checker] Unexpected error while running checks:", error);
    });
  });

  console.log("[checker] Background checker job scheduled - running every 5 minutes.");
}

module.exports = { startCheckerJob };
