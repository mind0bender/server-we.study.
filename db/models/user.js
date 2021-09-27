const { Schema, model } = require("mongoose");

const User = Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  groups: [
    {
      type: Schema.Types.ObjectId,
      required: true,
    },
  ],
});
module.exports = model("user", User);
