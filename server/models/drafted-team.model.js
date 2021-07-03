const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const draftedTeamSchema = new Schema({
  team_id: {
    type: Number,
  },
  team_name: {
    type: String,
  },
  team_owner: {
    type: String,
  },
  team_email: {
    type: String,
  },
  allowed_transfers: {
    type: Boolean,
  },
  team_players: {
    type: Array,
  },
});

module.exports = mongoose.model('drafted-teams-2021_2022', draftedTeamSchema);
