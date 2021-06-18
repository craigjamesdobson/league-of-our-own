const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fixturesSchema = new Schema({
  team_id: {
    type: Number,
  },
  name: {
    type: String,
  },
  matches: {
    type: Array,
  },
});

module.exports = mongoose.model('fixtures', fixturesSchema);
