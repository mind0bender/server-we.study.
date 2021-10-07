const { bgRedBright, greenBright } = require("chalk");
const { connect, connection } = require("mongoose");

connect(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mycluster.sxsst.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = connection;

console.log(greenBright.bold("connecting to DB\n"));

db.on("open", () => {
  console.log(greenBright.bold("connected to DB\n"));
});

db.once("error", (err) => {
  console.log(bgRedBright.bold("problem in DB\n"));
  console.log(err);
});
