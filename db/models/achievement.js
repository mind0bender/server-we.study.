const { Schema, model } = require("mongoose");

const Achievement = Schema({
  message: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
  color: {
    type: String,
    default: "#ffffff",
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  group: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  level: {
    type: Number,
    default: -1,
  },
});

module.exports = model("achievement", Achievement);
