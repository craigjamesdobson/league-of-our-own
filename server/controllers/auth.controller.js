const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService } = require('../services');
const { userService } = require('../services');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const token = await user.generateAuthToken();
  res.status(httpStatus.CREATED).send({ user, token });
  console.log('User created');
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const token = await user.generateAuthToken();
  res.send({ user, token });
});

module.exports = {
  register,
  login,
};
