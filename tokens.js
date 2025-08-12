const jwt = require('jsonwebtoken');

function signAccessToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
  });
}

module.exports = { signAccessToken, signRefreshToken };
// This code provides functions to sign access and refresh tokens using JWT.
// It uses environment variables for the secret keys and expiration times, ensuring secure token generation.