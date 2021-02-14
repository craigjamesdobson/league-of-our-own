const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const userService = require('./user.service');

const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return user;
};

const verifyToken = async (token) => {
  try {
    const payload = await jwt.verify(token, config.jwt.secret);
    const userId = payload._id;
    return userId;
  } catch (err) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Token is invalid');
  }
};

module.exports = {
  loginUserWithEmailAndPassword,
  verifyToken,
};
