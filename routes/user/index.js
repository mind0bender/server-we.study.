const { Router } = require("express");
const UserAuth = require("./auth");

const UserRouter = Router();

UserRouter.use("/auth", UserAuth);

module.exports = UserRouter;
