const User = require("../models/user");
const { setUser } = require("../service/auth");
const bcrypt = require("bcrypt"); // if you used bcryptjs, require("bcryptjs")

const SALT_ROUNDS = 10;

async function handleUserSignup(req, res) {
  const { name, email, password } = req.body;
  const trimmedEmail = (email || "").trim();

  // Hash password before saving
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  await User.create({
    name,
    email: trimmedEmail,
    password: hashedPassword,
  });

  return res.redirect("/");
}

async function handleUserLogin(req, res) {
  const { email, password } = req.body;
  const trimmedEmail = (email || "").trim();

  const user = await User.findOne({ email: trimmedEmail });

  console.log("Login attempt for:", trimmedEmail, "Found user:", !!user);

  // If user not found or password doesn't match -> show error
  if (!user) {
    return res.render("login", { error: "Invalid Username or Password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.render("login", { error: "Invalid Username or Password" });
  }

  const token = setUser(user);
  console.log("Created token length:", token?.length || 0);

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24,
    path: "/",
  });

  console.log("Cookie set on response (server-side).");

  return res.redirect("/");
}

module.exports = {
  handleUserSignup,
  handleUserLogin,
};