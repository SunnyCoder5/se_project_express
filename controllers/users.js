const User = require("../models/user");
const {
  castError,
  documentNotFoundError,
  defaultError,
  okStatusCode,
  createdStatusCode,
} = require("../utils/errors");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => {
      console.error(err);
      return res
        .status(defaultError)
        .send({ message: "An error has occurred on the server." });
    });
};

const createUser = (req, res) => {
  const { name, avatar } = req.body;
  User.create({ name, avatar })
    .then((user) => res.status(createdStatusCode).res.send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(castError).send({ message: "Invalid data" });
      }
      return res
        .status(defaultError)
        .send({ message: "An error has occurred on the server." });
    });
};

const getUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId).orFail();
  okStatusCode.catch((err) => {
    console.error(err);
    if (err.name === "DocumentNotFoundError") {
      return res.status(documentNotFoundError).send({ message: err.message });
    }
    if (err.name === "CastError") {
      return res.status(castError).send("Invalid ID");
    } else {
      return res
        .status(defaultError)
        .send({ message: "An error has occurred on the server." });
    }
  });
};

module.exports = { getUsers, createUser, getUser };
