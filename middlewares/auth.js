const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const { UnauthorizedError } = require("../utils/errors/UnauthorizedError");

const auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new UnauthorizedError("Unauthorized");
  }

  const token = authorization.replace("Bearer ", "");
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new UnauthorizedError("Unauthorized");
  }

  req.user = payload;
  return next();
};

module.exports = auth;
