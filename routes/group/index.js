const { Router } = require("express");
const { isValidObjectId } = require("mongoose");
const group = require("../../db/models/group");
const user = require("../../db/models/user");
const response = require("../../utils/response");

const GroupRouter = Router();

GroupRouter.post("/create", (req, res, next) => {
  const data = req.body;
  const errs = [];
  if (!data.name || !data.name.trim()) {
    errs.push(`Name is required. Invalid Name: ${data.name}`);
  }
  if (!data.admin) {
    errs.push(`Admin is required. Invalid admin: ${data.admin}`);
  } else if (!isValidObjectId(data.admin)) {
    errs.push(`Invalid Admin: ${data.admin}`);
  }
  if (errs.length) {
    res.send(
      response({
        res: false,
        errs,
        data: {
          admin: data.admin,
          name: data.name,
        },
        msg: "Group creation failed",
      })
    );
  } else {
    group
      .exists({ name: data.name, admin: data.admin })
      .then((exists) => {
        if (exists) {
          errs.push(`You already own a group named ${data.name}`);
          res.send(
            response({
              res: false,
              errs,
              data: {
                admin: data.admin,
                name: data.name,
              },
              msg: "Group creation failed",
            })
          );
        } else {
          user.exists({ _id: data.admin }).then((userExists) => {
            if (userExists) {
              const Group = new group({ ...data, members: [data.admin] });
              Group.save()
                .then((doc) => {
                  user
                    .updateOne(
                      { _id: data.admin },
                      { $push: { groups: doc._id } }
                    )
                    .then(() => {
                      res.send(
                        response({
                          data: {
                            group: doc,
                          },
                          msg: "Group created",
                        })
                      );
                    })
                    .catch(next);
                })
                .catch(next);
            } else {
              errs.push(`User not found`);
              res.send(
                response({
                  res: false,
                  errs,
                  data: {
                    admin: data.admin,
                    name: data.name,
                  },
                  msg: "Group creation failed",
                })
              );
            }
          });
        }
      })
      .catch(next);
  }
});

GroupRouter.post("/join", (req, res, next) => {
  const data = req.body;
  const errs = [];
  if (!data.user) {
    errs.push(`User is required: ${data.user}`);
  } else if (!isValidObjectId(data.user)) {
    errs.push(`Invalid User: ${data.user}`);
  }
  if (!data.group) {
    errs.push(`Group is required: ${data.group}`);
  } else if (!isValidObjectId(data.group)) {
    errs.push(`Invalid Group: ${data.group}`);
  }
  if (errs.length) {
    res.send(
      response({
        res: false,
        data: {
          user: data.user,
          group: data.group,
        },
        errs,
        msg: "Group not joined",
      })
    );
  } else {
    group
      .exists({ _id: data.group })
      .then((groupExists) => {
        if (groupExists) {
          user
            .exists({ _id: data.user })
            .then((userExists) => {
              if (userExists) {
                group
                  .findById(data.group)
                  .then((groupDoc) => {
                    if (!groupDoc.members.includes(data.user)) {
                      group
                        .updateOne(
                          { _id: data.group },
                          {
                            $push: { members: data.user },
                          }
                        )
                        .exec()
                        .then(() => {
                          user
                            .updateOne(
                              { _id: data.user },
                              {
                                $push: { groups: data.group },
                              }
                            )
                            .exec()
                            .then(() => {
                              res.send(
                                response({
                                  data: {
                                    group: data.group,
                                    user: data.user,
                                  },
                                  msg: `User joined group: ${groupDoc.name}`,
                                })
                              );
                            })
                            .catch(next);
                        })
                        .catch(next);
                    } else {
                      errs.push(`user already in the group`);
                      res.send(
                        response({
                          res: false,
                          data: {
                            user: data.user,
                            group: data.group,
                          },
                          errs,
                          msg: "Group not joined",
                        })
                      );
                    }
                  })
                  .catch(next);
              } else {
                errs.push(`User not found: ${data.user}`);
                res.send(
                  response({
                    res: false,
                    data: {
                      user: data.user,
                      group: data.group,
                    },
                    errs,
                    msg: "Group not joined",
                  })
                );
              }
            })
            .catch(next);
        } else {
          errs.push(`Group not found: ${data.group}`);
          res.send(
            response({
              res: false,
              data: {
                user: data.user,
                group: data.group,
              },
              errs,
              msg: "Group not joined",
            })
          );
        }
      })
      .catch(next);
  }
});

module.exports = GroupRouter;
