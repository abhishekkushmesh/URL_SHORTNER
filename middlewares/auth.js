const { getUser } = require("../service/auth");

function checkForAuthentication(req, res, next) {
  console.log("Incoming cookies (server):", req.cookies);
  req.user = null;
  const tokenCookie = req.cookies && req.cookies.token;
  if (!tokenCookie) return next();
  const token = tokenCookie;
  const user = getUser(token);
  req.user = user;
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