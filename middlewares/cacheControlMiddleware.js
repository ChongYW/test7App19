module.exports = (req, res, next) => {
    // Prevent caching for all routes
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '-1');
    next();
  };