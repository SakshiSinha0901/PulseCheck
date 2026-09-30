// This file holds the actual logic for signup and login.
// "Controller" just means: the code that runs when a specific route is hit.

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient");

// How many "rounds" of scrambling bcrypt does to the password before storing it.
// Higher = more secure but slower. 10 is a normal, safe default.
const SALT_ROUNDS = 10;

// Turns a user's info into a signed login token (JWT) that proves who they are
// on every future request, without them having to log in again and again.
function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// POST /api/auth/signup
async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    // Basic check: make sure nothing important is missing.
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are all required." });
    }

    // Check if someone already signed up with this email.
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    // Never store the real password - store a scrambled ("hashed") version instead.
    // Even if the database ever leaked, nobody could read the real password from this.
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = generateToken(user.id);

    // Send back the token and the user's basic info - but NEVER send the password back, even hashed.
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Something went wrong during signup." });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Deliberately vague message - never reveal whether it was the email or password that was wrong.
      // This stops attackers from figuring out which emails are registered.
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Compare the password the user just typed against the stored scrambled version.
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Something went wrong during login." });
  }
}

module.exports = { signup, login };
