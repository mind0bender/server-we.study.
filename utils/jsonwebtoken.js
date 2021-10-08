const jwt = require("jsonwebtoken");
const JWT_PASS = process.env.JWT_PASS;

const tokenGenerator = (_id, name) => {
  if (!_id || !name) {
    throw new Error("_id and name is required");
  }
  let token = jwt.sign(
    {
      _id,
      name,
    },
    JWT_PASS,
    {
      expiresIn: "5h",
    }
  );
  tokenDecoder(token, (err, dc) => {
    console.log(dc);
  });
  return token;
};
const tokenDecoder = (token, cb) => {
  jwt.verify(token, JWT_PASS, (err, decoded) => {
    const finalDecoded = {
      _id: decoded._id,
      name: decoded.name,
    };
    cb(err, finalDecoded);
  });
};

module.exports.tokenGenerator = tokenGenerator;
module.exports.tokenDecoder = tokenDecoder;
