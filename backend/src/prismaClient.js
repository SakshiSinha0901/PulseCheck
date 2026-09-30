// This file creates ONE shared connection to the database and hands it out
// to any other file that needs to talk to the database (signup, login, etc).
// Without this, every file would open its own separate connection, which wastes resources.

const { PrismaClient } = require("@prisma/client");

// Tip: uncomment the "log" option below to have Prisma print the ACTUAL raw SQL
// it generates for every query, right in your terminal. Useful for understanding
// what's really happening underneath (and for explaining it confidently in interviews)
// instead of just trusting "Prisma handles it." Turn it off again once you've seen enough -
// it prints a lot of lines.
const prisma = new PrismaClient({
  // log: ["query"],
});

module.exports = prisma;
