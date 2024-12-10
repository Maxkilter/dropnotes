const passport = require("passport");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "An error occurred during authentication" });
    }

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();
  })(req, res, next);
};
