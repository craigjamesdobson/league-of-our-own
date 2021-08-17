const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fixturesSchema = new Schema(
  {
    week: String,
    fixtures: [
      {
        id: Number,
        home: {
          id: Number,
          stats: Array
        },
        away: {
          id: Number,
          stats: Array
        },
        score: [Number, Number]
      },
    ]
  }
);

module.exports = mongoose.model('fixtures', fixturesSchema);
