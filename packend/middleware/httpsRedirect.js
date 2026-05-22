const httpsRedirect = (req, res, next) => {
  // Bypass HTTPS redirect for local testing
  if (req.hostname === 'localhost' || req.hostname === '127.0.0.1') {
    return next();
  }

  if (req.secure || req.get('x-forwarded-proto') === 'https') return next();
  return res.redirect('https://' + req.headers.host + req.originalUrl);
};

export default httpsRedirect;
