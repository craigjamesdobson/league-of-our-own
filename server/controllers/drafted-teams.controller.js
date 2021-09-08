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

const updateDraftedTeams = catchAsync(async (req, res) => {
  try {
    DraftedTeam.bulkWrite(
      req.body.map((team) => 
        ({
          updateOne: {
            filter: { team_id: team.id },
            update: { $set: { gameweek_stats: team.gameWeekStats } },
          }
        })
      )
    )
    res.status(httpStatus.OK).send({
        message: 'Drafted teams have been updated'
    });
    console.log('Drafted teams have been updated')
  }
  catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Drafted team not found');
  }
});

module.exports = {
  getDraftedTeams,
  updateDraftedTeams
};
