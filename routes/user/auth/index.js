const { Router } = require("express");
const response = require("../../../utils/response");
const validator = require("validator");
const user = require("../../../db/models/user");
const { hash, compare } = require("../../../utils/password");
const { tokenGenerator, tokenDecoder } = require("../../../utils/jsonwebtoken");

const UserAuth = Router();

/**
 * @param data name email password;
 * * User signup route
 * ? Should i implement google signup also?
 */
UserAuth.post("/signup", (req, res, next) => {
  const data = req.body;
  const errs = [];

  if (!data.name || !data.name.trim() || validator.isEmail(data.name + "")) {
    errs.push(`Invalid name: ${data.name}`);
  }
  if (!data.email) {
    errs.push(`Email is required`);
  } else {
    if (!validator.isEmail(data.email + "")) {
      errs.push(`Invalid email.\n${data.email}`);
    }
  }
  if (!data.password || !data.password.trim()) {
    errs.push(`Password is required`);
  } else if (data.password.length < 8) {
    errs.push(`Password must not be shorter than 8 characters`);
  }

  if (errs.length) {
    res.send(
      response({
        res: false,
        errs,
        msg: `There ${
          errs.length == 1 ? "is an error" : `are total ${errs.length} errors`
        }`,
      })
    );
  } else {
    user
      .exists({ email: data.email })
      .then((exists1) => {
        user.exists({ name: data.name }).then((exists2) => {
          if (exists1) {
            errs.push(`This email is already registered`);
          }
          if (exists2) {
            errs.push(`This username is already registered`);
          }
          if (!exists1 && !exists2) {
            hash(data.password, next, (hashed) => {
              const client = new user({ ...data, password: hashed });
              client
                .save()
                .then((doc) => {
                  const token = tokenGenerator(doc._id, doc.name);
                  res.status(201).send(
                    response({
                      res: true,
                      msg: "User signed up",
                      data: {
                        user: doc,
                        token,
                      },
                    })
                  );
                })
                .catch(next)
                .catch(next);
            });
          } else {
            res.send(
              response({
                res: false,
                errs,
                msg: `There ${
                  errs.length == 1
                    ? "is an error"
                    : `are total ${errs.length} errors`
                }`,
              })
            );
          }
        });
      })
      .catch(next);
  }
});

/**
 * @param data nameOrEmail password
 * * user signin route
 */

UserAuth.post("/signin", (req, res, next) => {
  const data = req.body;
  const errs = [];
  let signinWith;
  if (!data.nameOrEmail || !data.nameOrEmail.trim()) {
    errs.push(`Name or Email is required`);
  } else {
    if (data.nameOrEmail && validator.isEmail(data.nameOrEmail + "")) {
      signinWith = { email: data.nameOrEmail };
    } else if (data.nameOrEmail && data.nameOrEmail.trim()) {
      signinWith = { name: data.nameOrEmail };
    } else {
      errs.push(`Invalid Name or Email`);
    }
  }

  if (!data.password || !data.password.trim()) {
    errs.push(`Password is required`);
  } else if (data.password.length < 8) {
    errs.push(`Password must not be shorter than 8 characters`);
  }

  if (errs.length) {
    res.send(
      response({
        res: false,
        errs,
        msg: `There ${
          errs.length == 1 ? "is an error" : `are total ${errs.length} errors`
        }`,
      })
    );
  } else {
    user
      .exists(signinWith)
      .then((exists) => {
        if (exists) {
          user
            .findOne(signinWith)
            .then((doc) => {
              compare(doc.password, data.password, next, (same) => {
                if (same) {
                  const token = tokenGenerator(doc._id, doc.name);
                  res.send(
                    response({
                      msg: "user authenticated",
                      data: {
                        user: doc,
                        token,
                      },
                    })
                  );
                } else {
                  ressend(
                    response({
                      res: false,
                      errs: ["Wrong password"],
                      msg: `Bad Authentication`,
                    })
                  );
                }
              });
            })
            .catch(next);
        } else {
          res.send(
            response({
              res: false,
              errs: ["user not found"],
              msg: `Bad Authentication`,
            })
          );
        }
      })
      .catch(next);
  }
});

/**
 * @param data token
 * * JWT verification route for user
 */

UserAuth.post("/verify", (req, res, next) => {
  const { token } = req.body;
  if (!token) {
    res.send(
      response({
        res: false,
        data: {
          token,
        },
        errs: [`Token is required: ${token}`],
        msg: "Token is required",
      })
    );
  } else {
    try {
      tokenDecoder(token, (err, decoded) => {
        if (err) throw new Error(err);
        else {
          user
            .exists({ _id: decoded._id })
            .then((exists) => {
              if (exists) {
                user
                  .findById(decoded._id)
                  .then((doc) => {
                    const newToken = tokenGenerator(doc._id, doc.name);
                    res.send(
                      response({
                        data: {
                          user: doc,
                          token: newToken,
                        },
                        msg: "user verified",
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

module.exports = UserAuth;
