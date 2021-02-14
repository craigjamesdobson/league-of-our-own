const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService } = require('../services');
const { userService } = require('../services');

const getUser = catchAsync(async (req, res) => {
  const token = req.headers.authorization.split('Bearer ')[1];

  if (token) {
    const userID = await authService.verifyToken(token);
    const userData = await userService.getUserById(userID);
    res.status(httpStatus.ACCEPTED).send(userData);
  }
});

module.exports = {
  getUser,
};
