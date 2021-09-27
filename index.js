require("dotenv").config();
const bodyParser = require("body-parser");
const { underline } = require("chalk");
const express = require("express");
const morgan = require("morgan");
const routes = require("./routes");
const response = require("./utils/response");

const app = express();

// Middlewares
app.use(morgan("tiny"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const PORT = process.env.PORT || 8080;
const ISDEV = process.env.NODE_ENV !== "production";

app.listen(PORT, () => {
  console.clear();
  console.log(
    `Server started on PORT ${underline.blueBright(PORT)} at ${Date()} as ${
      ISDEV ? "DEV" : "PROD"
    }`
  );
});

app.use("/api/v1", routes);

app.get("/errorstructure", (req, res) => {
  throw new Error("Error structure");
});

// Database
require("./db");

// Error handler
app.use((err, req, res, next) => {
  res.status(500).send(
    response({
      res: false,
      msg: "Internal Server Error, contact DEVELOPER for help.",
      data: {
        msg: err.message,
        stack: ISDEV ? err.stack : `Can't show ERROR STACK on production`,
      },
      errs: [err.message + err.stack],
      path: req.originalUrl,
    })
  );
});

// Route not found
app.use("*", (req, res, next) => {
  res.status(404).send(
    response({
      res: false,
      msg: `Route not found`,
      data: {
        path: req.originalUrl,
        query: req.query,
        params: req.params,
      },
    })
  );
});