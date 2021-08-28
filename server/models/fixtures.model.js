const { string } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fixturesSchema = new Schema(
  {
    week: String,
    updatedBy: String,
    fixtures: [
      {
        _id: false,
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
    ],
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('fixtures-2021-2022', fixturesSchema);
