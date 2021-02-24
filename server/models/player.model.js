const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerSchema = new Schema({
  chance_of_playing_next_round: {
    type: Number,
  },
  chance_of_playing_this_round: {
    type: Number,
  },
  code: {
    type: Number,
  },
  cost_change_event: {
    type: Number,
  },
  cost_change_event_fall: {
    type: Number,
  },
  cost_change_start: {
    type: Number,
  },
  cost_change_start_fall: {
    type: Number,
  },
  dreamteam_count: {
    type: Number,
  },
  element_type: {
    type: Number,
  },
  ep_next: {
    type: String,
  },
  ep_this: {
    type: String,
  },
  event_points: {
    type: Number,
  },
  first_name: {
    type: String,
  },
  form: {
    type: String,
  },
  id: {
    type: Number,
  },
  in_dreamteam: {
    type: Boolean,
  },
  news: {
    type: String,
  },
  news_added: {
    type: String,
  },
  now_cost: {
    type: Number,
  },
  photo: {
    type: String,
  },
  points_per_game: {
    type: String,
  },
  second_name: {
    type: String,
  },
  selected_by_percent: {
    type: String,
  },
  special: {
    type: Boolean,
  },
  squad_number: {
    type: Number,
  },
  status: {
    type: String,
  },
  team: {
    type: Number,
  },
  team_code: {
    type: Number,
  },
  total_points: {
    type: Number,
  },
  transfers_in: {
    type: Number,
  },
  transfers_in_event: {
    type: Number,
  },
  transfers_out: {
    type: Number,
  },
  transfers_out_event: {
    type: Number,
  },
  value_form: {
    type: String,
  },
  value_season: {
    type: String,
  },
  web_name: {
    type: String,
  },
  minutes: {
    type: Number,
  },
  goals_scored: {
    type: Number,
  },
  assists: {
    type: Number,
  },
  clean_sheets: {
    type: Number,
  },
  goals_conceded: {
    type: Number,
  },
  own_goals: {
    type: Number,
  },
  penalties_saved: {
    type: Number,
  },
  penalties_missed: {
    type: Number,
  },
  yellow_cards: {
    type: Number,
  },
  red_cards: {
    type: Number,
  },
  saves: {
    type: Number,
  },
  bonus: {
    type: Number,
  },
  bps: {
    type: Number,
  },
  influence: {
    type: String,
  },
  creativity: {
    type: String,
  },
  threat: {
    type: String,
  },
  ict_index: {
    type: String,
  },
  influence_rank: {
    type: Number,
  },
  influence_rank_type: {
    type: Number,
  },
  creativity_rank: {
    type: Number,
  },
  creativity_rank_type: {
    type: Number,
  },
  threat_rank: {
    type: Number,
  },
  threat_rank_type: {
    type: Number,
  },
  ict_index_rank: {
    type: Number,
  },
  ict_index_rank_type: {
    type: Number,
  },
  corners_and_indirect_freekicks_order: {
    type: Number,
  },
  corners_and_indirect_freekicks_text: {
    type: String,
  },
  direct_freekicks_order: {
    type: Number,
  },
  direct_freekicks_text: {
    type: String,
  },
  penalties_order: {
    type: String,
  },
  penalties_text: {
    type: String,
  },
});

module.exports = mongoose.model('Player', playerSchema);
