const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const DraftedTeam = require('../models/drafted-team.model');
const catchAsync = require('../utils/catchAsync');

const getDraftedTeams = catchAsync(async (req, res) => {
  const draftedTeams = await DraftedTeam.find({});
  res.status(httpStatus.OK).send({
    message: 'Fetched drafted teams successfully.',
    draftedTeams: draftedTeams,
  });
});

module.exports = {
  getDraftedTeams,
};
