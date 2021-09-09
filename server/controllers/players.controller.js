const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const Player = require('../models/player.model');
const catchAsync = require('../utils/catchAsync');

const getPlayers = catchAsync(async (req, res) => {
  const players = await Player.find({}).select(
    `-_id
      id
      code
      status
      news
      status
      team
      now_cost
      cost_change_start_fall
      first_name
      second_name
      web_name
      squad_number
      element_type
      gameweek_stats`
  );
  res
    .status(httpStatus.OK)
    .send({ message: 'Fetched players successfully.', players: players });
});

const updatePlayers = catchAsync(async (req, res) => {
  try {
    Player.bulkWrite(
      req.body.map((player) => 
        ({
          updateOne: {
            filter: { id: player.id },
            update: { $set: { gameweek_stats: player.gameWeekStats } },
          }
        })
      )
    )
    res.status(httpStatus.OK).send({
        message: 'Players have been updated'
    });
    console.log('Players have been updated')
  }
  catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Player not found');
  }
});

module.exports = {
  getPlayers,
  updatePlayers,
};
