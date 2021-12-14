const { Router } = require("express");
const { isValidObjectId } = require("mongoose");
const group = require("../../db/models/group");
const user = require("../../db/models/user");
const response = require("../../utils/response");
const { tokenDecoder, tokenGenerator } = require("../../utils/jsonwebtoken");

const GroupRouter = Router();

/**
 * @param data name(string) token(string=>jwt) displayPicture;
 * * Group creation route
 */
GroupRouter.post("/create", (req, res, next) => {
  const data = req.body;
  const errs = [];
  const { token, name, desc, displayPicture } = data;

  if (!name || !name.trim()) {
    errs.push(`name is required ${name}`);
  }
  if (!token || !token.trim()) {
    errs.push(`token is required ${token}`);
  }
  if (!desc || !desc.trim()) {
    errs.push(`Description is required`);
  }
  if (errs.length) {
    res.send(
      response({
        res: false,
        errs,
        data,
        msg: "group creation failed",
      })
    );
  } else {
    try {
      tokenDecoder(token, (err, decoded) => {
        if (err) next(err);
        if (decoded) {
          const admin = decoded._id;
          group
            .exists({
              name,
              admin,
            })
            .then((groupExists) => {
              if (groupExists) {
                errs.push(`Group already exists`);
                res.send(
                  response({
                    res: false,
                    errs,
                    data,
                    msg: "group creation failed",
                  })
                );
              } else {
                const newGroup = new group({
                  name,
                  desc,
                  admin,
                  members: [admin],
                });
                if (displayPicture) {
                  newGroup.displayPicture = displayPicture;
                }
                user
                  .findOneAndUpdate(
                    { _id: admin },
                    {
                      $push: {
                        groups: newGroup._id,
                      },
                    }
                  )
                  .then((adminDoc) => {
                    newGroup
                      .save()
                      .then((groupDoc) => {
                        res.send(
                          response({
                            data: {
                              group: groupDoc,
                              admin: adminDoc,
                            },
                            msg: "group created",
                          })
                        );
                      })
                      .catch(next);
                  })
                  .catch(next);
              }
            })
            .catch(next);
        }
      });
    } catch (error) {
      errs.push(`Invalid token`);
      res.send(
        response({
          res: false,
          errs,
          data,
          msg: "group creation failed",
        })
      );
    }
  }
});

/**
 * @param data group(string=>_id) token(string=>jwt);
 * * Group Join route
 */

GroupRouter.post("/joinrequest", (req, res, next) => {
  const data = req.body;
  const errs = [];
  if (!data.group || !data.group.trim()) {
    errs.push(`Group is required ${data.group}`);
  }
  if (!data.token || !data.group.trim()) {
    errs.push(`Token is required ${data.token}`);
  }
  if (errs.length) {
    res.send(
      response({
        res: false,
        data,
        errs,
        msg: "Group join request failed",
      })
    );
  }
});

GroupRouter.post("/getgroups", (req, res, next) => {
  const data = req.body;
  const errs = [];
  if (!data.user) {
    errs.push(`User is required`);
  } else if (!isValidObjectId(data.user)) {
    errs.push(`Invalid user`);
  }
  if (errs.length) {
    res.send(
      response({
        res: false,
        data: {
          user: data.user,
        },
        errs,
        msg: "Operation failed",
      })
    );
  } else {
    user
      .exists({ _id: data.user })
      .then((exists) => {
        if (exists) {
          user.findById(data.user).then((userDoc) => {
            group
              .find({
                _id: {
                  $in: userDoc.groups,
                },
              })
              .then((groupDocs) => {
                res.send(
                  response({
                    data: {
                      groups: groupDocs,
                    },
                    msg: "Operation success",
                  })
                );
              });
          });
        } else {
          errs.push(`user not found`);
          res.send(
            response({
              res: false,
              data: {
                user: data.user,
              },
              errs,
              msg: "Operation failed",
            })
          );
        }
      })
      .catch(next);
  }
});

GroupRouter.post("/getgroup", (req, res, next) => {
  const data = req.body;
  const errs = [];
  if (!data.group) {
    errs.push(`Group is reqired`);
  } else if (!isValidObjectId(data.group)) {
    errs.push(`Invalid group`);
  }
  if (errs.length) {
    res.send(
      response({
        res: false,
        data: {
          groupId: data.group,
        },
        msg: "Operation failed",
      })
    );
  } else {
    group
      .exists({ _id: data.group })
      .then((exists) => {
        if (exists) {
          group
            .findById(data.group)
            .then((groupDoc) => {
              user
                .findById(groupDoc.admin)
                .then((adminDoc) => {
                  user
                    .find({
                      _id: {
                        $in: groupDoc.members,
                      },
                    })
                    .then((memberDocs) => {
                      res.send(
                        response({
                          data: {
                            group: groupDoc,
                            admin: {
                              name: adminDoc.name,
                              displayPicture: adminDoc.displayPicture,
                            },
                            members: memberDocs.map((member) => {
                              return {
                                name: member.name,
                                displayPicture: member.displayPicture,
                              };
                            }),
                          },
                          msg: "Operation success",
                        })
                      );
                    })
                    .catch(next);
                })
                .catch(next);
            })
            .catch(next);
        } else {
          errs.push(`Group not found`);
          res.send(
            response({
              res: false,
              data: {
                groupId: data.group,
              },
              msg: "Operation failed",
            })
          );
        }
      })
      .catch(next);
  }
});

module.exports = GroupRouter;
