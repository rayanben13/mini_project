import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import prisma from '../lib/prisma.ts';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.ACCESS_TOKEN_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await prisma.users.findUnique({
        where: { id_user: jwt_payload.id },
      });

      if (user) {
        if (user.is_active) {
          return done(null, {
            id_user: user.id_user,
            email: user.email,
            username: user.username,
            role: user.role,
          });
        } else {
          return done(null, false, { message: 'User not verified' });
        }
      } else {
        return done(null, false, { message: 'User not found' });
      }
    } catch (err) {
      return done(err, false, { message: 'Server error' });
    }
  })
);

export default passport;
