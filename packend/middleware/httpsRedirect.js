const httpsRedirect = (req, res, next) => {
  if (req.secure || req.get('x-forwarded-proto') === 'https') return next();
  return res.redirect('https://' + req.headers.host + req.originalUrl);
};

export default httpsRedirect;
