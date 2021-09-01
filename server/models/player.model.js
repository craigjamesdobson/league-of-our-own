const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerSchema = new Schema({
  id: Number,
  code: Number,
  status: String,
  news: String,
  team: Number,
  now_cost: Number,
  cost_change_start_fall: Number,
  first_name: String,
  second_name: String,
  web_name: String,
  squad_number: Number,
  element_type: Number,
  gameweek_stats: Array,
});

module.exports = mongoose.model('Player', playerSchema);
