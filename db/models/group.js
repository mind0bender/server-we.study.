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
  displayPicture: {
    type: String,
    default:
      "https://cdn.filestackcontent.com/ARVNFDkIFTCy2nOXvYSoLz/security=policy:eyJleHBpcnkiOjE2NTM5NDgwMDB9,signature:08aafeb16f44bba501b0ddd33d6932fdd523af5bdf62a163b78f0a7e5eb54be7/7JyykSlYQyaoiJYwnLaM",
  },
});

module.exports = model("group", Group);
