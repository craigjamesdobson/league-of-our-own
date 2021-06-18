const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const Fixtures = require('../models/fixtures.model');
const catchAsync = require('../utils/catchAsync');

const getFixtures = catchAsync(async (req, res) => {
  const fixtures = await Fixtures.find({});
  res.status(httpStatus.OK).send({
    message: 'Fetched fixtures successfully.',
    fixtures: fixtures,
  });
});

module.exports = {
  getFixtures,
};
