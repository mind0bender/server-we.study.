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
  about: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    required: true,
  },
  displayPicture: {
    type: String,
    default: "https://cdn.filestackcontent.com/aDB3bOkQf2A59bGOA26A",
  },
  groups: [
    {
      type: Schema.Types.ObjectId,
      required: true,
    },
  ],
});

module.exports = model("user", User);
