const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const draftedTeamSchema = new Schema({
  team_id: Number,
  team_name: String,
  team_owner: String,
  team_email: String,
  allowed_transfers: Boolean,
  team_players: Array,
  gameweek_stats: Array,
});

module.exports = mongoose.model('drafted-teams-2021_2022', draftedTeamSchema);
