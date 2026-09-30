// "Middleware" is code that runs BEFORE a route's real logic, to check something first.
// This one checks: "does this request have a valid login token?" If not, it blocks the request.
// We'll use this starting in Phase 2, to protect routes like "add a website" so only
// logged-in users can use them.

const jwt = require("jsonwebtoken");

function protect(req, res, next) {
  const authHeader = req.headers.authorization; // expected format: "Bearer <token>"

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No login token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // stash the logged-in user's id for the next function to use
    next(); // token is valid - let the request continue to its real route
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired login token." });
  }
}

module.exports = { protect };
