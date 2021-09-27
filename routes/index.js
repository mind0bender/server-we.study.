const { Router } = require("express");
const UserRouter = require("./user");

const routes = Router();

routes.use("/user", UserRouter);

module.exports = routes;
