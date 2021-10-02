const { Router } = require("express");
const { isValidObjectId } = require("mongoose");
const user = require("../../db/models/user");
const UserAuth = require("./auth");
const validator = require("validator");
const response = require("../../utils/response");
const { token } = require("morgan");
const { tokenDecoder, tokenGenerator } = require("../../utils/jsonwebtoken");

const UserRouter = Router();

UserRouter.use("/auth", UserAuth);

UserRouter.post("/update", (req, res, next) => {
  const data = req.body;
  const errs = [];
  if (typeof data.user !== "object") {
    errs.push(`User is required`);
  } else {
    if (!data.user._id) {
      errs.push(`User is required`);
    } else if (!isValidObjectId(data.user._id)) {
      errs.push(`User not Valid`);
    }
    if (
      !data.user.name ||
      !data.user.name.trim() ||
      validator.isEmail(data.user.name + "")
    ) {
      errs.push(`Invalid Name`);
    }
    if (
      (!data.user.email || !data.user.email.trim()) &&
      !validator.isEmail(data.user.email + "")
    ) {
      errs.push(`Invalid Email`);
    }
    if (!data.user.about || !data.user.about.trim()) {
      errs.push(`Invalid About`);
    }
    if (!data.user.displayPicture || !data.user.displayPicture.trim()) {
      errs.push(`Invalid displayPicture`);
    }
  }
  if (errs.length) {
    res.send(
      response({
        res: false,
        data: {
          user: data.user,
          token: data.token,
        },
        errs,
        msg: "User update failed",
      })
    );
  } else {
    try {
      tokenDecoder(data.token, (err, decoded) => {
        if (err) throw new Error(err);
        else {
          user
            .exists({ _id: decoded._id, name: data.user.name })
            .then((exists) => {
              if (exists) {
                user
                  .findByIdAndUpdate(decoded._id, {
                    name: data.user.name,
                    email: data.user.email,
                    displayPicture: data.user.displayPicture,
                    about: data.user.about,
                  })
                  .then((doc) => {
                    const newToken = tokenGenerator(doc._id, doc.name);
                    res.send(
                      response({
                        data: {
                          user: doc,
                          token: newToken,
                        },
                        msg: "user updated",
                      })
                    );
                  })
                  .catch(next);
              } else {
                res.send(
                  response({
                    res: false,
                    data: {
                      token,
                    },
                    errs: ["User not found"],
                    msg: "User not found",
                  })
                );
              }
            })
            .catch(next);
        }
      });
    } catch (error) {
      res.send(
        response({
          res: false,
          data: { token },
          errs: ["Invalid Token"],
          msg: "Invalid Token",
        })
      );
    }
  }
});

module.exports = UserRouter;
