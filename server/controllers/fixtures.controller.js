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

const updateFixtures = catchAsync(async (req, res) => {
  try {
    await Fixtures.updateOne(
      { week: req.body.week },
      { 
        $set: {
        fixtures: req.body.fixtures,
        updatedBy: req.body.updatedBy,
        updatedAt: req.body.updatedAt,
        } 
      }
    )
    res.status(httpStatus.OK).send({
      message: 'Fixtures have been updated'
    });
    console.log('Fixtures have been updated')
  } catch {
      throw new ApiError(httpStatus.NOT_FOUND, 'Fixture not found');
  }
});

module.exports = {
  getFixtures,
  updateFixtures
};
