// This file holds the logic for adding, listing, and deleting monitored websites.
// Every function here assumes the "protect" middleware already ran first and
// confirmed the user is logged in - that's how we know req.userId is available.

const prisma = require("../prismaClient");

// POST /api/sites - add a new website to watch
async function addSite(req, res) {
  try {
    const { url, name } = req.body;

    if (!url || !name) {
      return res.status(400).json({ error: "Both url and name are required." });
    }

    const site = await prisma.monitoredSite.create({
      data: {
        url,
        name,
        userId: req.userId, // ties this site to whichever user is currently logged in
      },
    });

    res.status(201).json(site);
  } catch (error) {
    console.error("Add site error:", error);
    res.status(500).json({ error: "Something went wrong while adding the site." });
  }
}

// GET /api/sites - list only the sites that belong to the logged-in user
async function getSites(req, res) {
  try {
    const sites = await prisma.monitoredSite.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" }, // newest added site shows up first
    });

    res.json(sites);
  } catch (error) {
    console.error("Get sites error:", error);
    res.status(500).json({ error: "Something went wrong while fetching your sites." });
  }
}

// DELETE /api/sites/:id - remove a site, but only if it actually belongs to this user
async function deleteSite(req, res) {
  try {
    const siteId = Number(req.params.id);

    const site = await prisma.monitoredSite.findUnique({ where: { id: siteId } });

    if (!site) {
      return res.status(404).json({ error: "Site not found." });
    }

    // Security check: stop User A from deleting User B's website just by guessing an id.
    if (site.userId !== req.userId) {
      return res.status(403).json({ error: "You don't have permission to delete this site." });
    }

    await prisma.monitoredSite.delete({ where: { id: siteId } });

    res.json({ message: "Site deleted successfully." });
  } catch (error) {
    console.error("Delete site error:", error);
    res.status(500).json({ error: "Something went wrong while deleting the site." });
  }
}

// GET /api/sites/:id/stats - uptime percentage, average response time, and recent history
async function getSiteStats(req, res) {
  try {
    const siteId = Number(req.params.id);

    const site = await prisma.monitoredSite.findUnique({ where: { id: siteId } });

    if (!site) {
      return res.status(404).json({ error: "Site not found." });
    }

    // Same ownership check as delete - don't let User A see User B's site stats.
    if (site.userId !== req.userId) {
      return res.status(403).json({ error: "You don't have permission to view this site's stats." });
    }

    // Instead of pulling every CheckResult row into JavaScript and counting them
    // ourselves (slow and wasteful once there are thousands of rows), we ask the
    // database to do the counting and averaging directly - it's built for exactly this.
    const [totalChecks, upChecks, avgResponseTime, recentHistory] = await Promise.all([
      prisma.checkResult.count({ where: { siteId } }),
      prisma.checkResult.count({ where: { siteId, status: "up" } }),
      // "down" checks have no responseTimeMs (the site never responded), so averaging
      // only over "up" checks avoids those empty values skewing the number.
      prisma.checkResult.aggregate({
        where: { siteId, status: "up" },
        _avg: { responseTimeMs: true },
      }),
      // The most recent 20 checks, newest first - useful for drawing a small history chart later.
      prisma.checkResult.findMany({
        where: { siteId },
        orderBy: { checkedAt: "desc" },
        take: 20,
      }),
    ]);

    const uptimePercentage = totalChecks === 0 ? null : Number(((upChecks / totalChecks) * 100).toFixed(2));

    res.json({
      site: { id: site.id, name: site.name, url: site.url },
      totalChecks,
      uptimePercentage, // e.g. 98.5 means "up 98.5% of the time we've checked it"
      averageResponseTimeMs: avgResponseTime._avg.responseTimeMs
        ? Math.round(avgResponseTime._avg.responseTimeMs)
        : null,
      recentHistory,
    });
  } catch (error) {
    console.error("Get site stats error:", error);
    res.status(500).json({ error: "Something went wrong while fetching site stats." });
  }
}

module.exports = { addSite, getSites, deleteSite, getSiteStats };
