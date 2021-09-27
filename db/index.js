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

db.on("open", () => {
  console.log(greenBright.bold("    Connected to DB"));
});

db.once("error", (err) => {
  console.log(bgRedBright.bold("    Problem in DB"));
  console.log(err);
});
