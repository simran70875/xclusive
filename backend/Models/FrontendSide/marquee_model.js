const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MarqueeSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
});


module.exports =  mongoose.model("Marquee", MarqueeSchema);