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
     news team 
     now_cost 
     cost_change_start_fall 
     first_name 
     second_name 
     web_name 
     element_type 
     goals_scored 
     assists 
     clean_sheets`
  );
  res
    .status(httpStatus.OK)
    .send({ message: 'Fetched players successfully.', players: players });
});

module.exports = {
  getPlayers,
};
