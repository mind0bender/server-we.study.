const { Router } = require("express");
const GroupRouter = require("./group");
const UserRouter = require("./user");

const routes = Router();

routes.use("/user", UserRouter);
routes.use("/group", GroupRouter);

module.exports = routes;
