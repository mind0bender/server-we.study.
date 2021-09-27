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
  user: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

module.exports = model("achievement", Achievement);
