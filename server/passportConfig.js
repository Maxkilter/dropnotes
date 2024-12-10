const JwtStrategy = require("passport-jwt").Strategy;
const User = require("./models/User");

const cookieExtractor = (req) => req?.cookies?.jwtToken || null;

const options = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET_KEY,
};

module.exports = (passport) =>
  passport.use(
    new JwtStrategy(options, async (jwtPayload, done) => {
      try {
        const user = await User.findById(jwtPayload.userId);
        if (!user) {
          return done(null, false);
        }
        return done(null, { userId: user._id.toString() });
      } catch (err) {
        return done(err, false);
      }
    })
  );
