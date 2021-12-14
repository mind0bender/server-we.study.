const { Schema, model } = require("mongoose");

const notifications = Schema({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  data: {
    type: Schema.Types.Map,
    default: {},
  },
});

module.exports = model("notification", notifications);
