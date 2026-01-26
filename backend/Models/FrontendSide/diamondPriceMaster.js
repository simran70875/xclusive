const mongoose = require("mongoose");

const DiamondPriceMasterSchema = new mongoose.Schema({
  shape: {
    type: String,
    default: "round" // future-proof for square, princess, etc.
  },

  mmFrom: Number,          // 1.00
  mmTo: Number,            // 1.10         // e.g. 1.50
  caratWeightFrom: Number,    // e.g. 0.015 (per stone)
  caratWeightTo: Number, 
  sieveSize: String,

  qualityRates: {
    lab_vvs_vs: Number,   // ₹ per carat
    natural_fg_vs: Number,
    natural_gh_si: Number,
    natural_hi_si: Number
  },

  active: {
    type: Boolean,
    default: true
  },

  updatedAt: Date
});

module.exports = mongoose.model(
  "DiamondPriceMaster",
  DiamondPriceMasterSchema
);
