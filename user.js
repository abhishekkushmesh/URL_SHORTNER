const User = require("../models/user");
const { setUser } = require("../service/auth");

async function handleUserSignup(req, res) {
  const { name, email, password } = req.body;
  await User.create({
    name,
    email,
    password,
  });
  return res.redirect("/");
}

async function handleUserLogin(req, res) {
  const { email, password } = req.body;
  const trimmedEmail = (email || "").trim();

  const user = await User.findOne({ email: trimmedEmail });

  console.log("Login attempt for:", trimmedEmail, "Found user:", !!user);

  if (!user || user.password !== password) {
    return res.render("login", {
      error: "Invalid Username or Password",
    });
  }

  const token = setUser(user);
  console.log("Created token length:", token?.length || 0);

  // Set cookie with sensible options
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    path: "/",
  });

  console.log("Cookie set on response (server-side).");

  return res.redirect("/");
}

module.exports = {
  handleUserSignup,
  handleUserLogin,
};