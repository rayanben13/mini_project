import passport from 'passport';

import '../config/passport.js';

export const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (user) {
      req.user = user; // user authenticated
    } else {
      req.user = { role: 'guest' }; // guest
    }

    return next();
  })(req, res, next);
};
