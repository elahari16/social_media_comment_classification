const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];

    if (!token) {
      throw new Error("No token provided");
    }

    const { userId, isAdmin } = jwt.verify(token, process.env.TOKEN_KEY);

    req.user = {
      userId,
      isAdmin,
    };

    return next();
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const optionallyVerifyToken = (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];

    if (!token) return next();

    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = {
      userId: decoded.userId,
    };

    next();
  } catch (err) {
    return next();
  }
};

module.exports = { verifyToken, optionallyVerifyToken };
