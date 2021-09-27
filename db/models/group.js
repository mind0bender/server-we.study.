const { Schema, model } = require("mongoose");

const Group = Schema({
  name: {
    type: String,
    required: true,
  },
  admin: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      required: true,
    },
  ],
});

module.exports = model("group", Group);
