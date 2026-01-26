const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MetalPriceMasterSchema = new Schema({
  metalName: String, // Gold, Silver, Platinum
  symbol: { type: String, default: "XAU" }, // XAU, XAG (optional)
  basePurity: Number, // 24 (gold), 999 (silver)
  baseRate: Number, // rate per gram (24K / 999)
  priceSource: String, // goldapi | manual
  purityRates: [
    {
      purity: Number, // 24, 22, 18 | 999, 925
      factor: Number, // auto calculated
      ratePerGram: Number, // auto calculated
    },
  ],
  updatedAt: Date,
});

module.exports = mongoose.model("MetalPriceMaster", MetalPriceMasterSchema);
