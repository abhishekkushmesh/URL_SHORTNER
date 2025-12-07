// middlewares/auth.js
const { getUser } = require("../service/auth");

function checkForAuthentication(req, res, next) {
  console.log("Incoming cookies (server):", req.cookies);
  req.user = null;

  const tokenCookie = req.cookies && req.cookies.token;
  if (!tokenCookie) {
    res.locals.user = null;
    return next();
  }
function setUser(user) {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name, // include name so templates can show it
    },
    secret
  );
}
  const user = getUser(tokenCookie);
  req.user = user;
  res.locals.user = user;
  console.log("Decoded token user:", user);
  return next();
}

function restrictTo(roles = []) {
  return function (req, res, next) {
    if (!req.user) return res.redirect("/login");
    if (!roles.includes(req.user.role)) return res.end("UnAuthorized");
    return next();
  };
}

module.exports = {
  checkForAuthentication,
  restrictTo,
};