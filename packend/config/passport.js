import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import pool from './db.js';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.ACCESS_TOKEN_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const result = await pool.query(
        'SELECT id_user, email, is_verified FROM project02.users WHERE id_user=$1',
        [jwt_payload.id]
      );

      if (result.rows.length > 0) {
        const user = result.rows[0];
        if (user.is_verified) {
          return done(null, { id_user: user.id_user, email: user.email });
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
