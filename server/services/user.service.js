const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Email is already registered. Please login.'
    );
  }
  const user = await User.create(userBody);
  return user;
};

const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

const getUserById = async (id) => {
  return User.findById(id);
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
};
