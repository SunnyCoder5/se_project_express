const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");

const User = require("../models/user");
const {
  castError,
  documentNotFoundError,
  defaultError,
  duplicateError,
  unauthorizedError,
} = require("../utils/errors");

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;
  if (!email) {
    console.log("Missing email - should send 400");
    return res.status(castError).send({ message: "Email is required" });
  }
  if (!password) {
    console.log("Missing email - should send 400");
    return res.status(castError).send({ message: "Password is required" });
  }
  return User.findOne({ email }).then((existingUser) => {
    if (existingUser) {
      return res
        .status(duplicateError)
        .send({ message: "This email already exists" });
    }
    return bcrypt
      .hash(password, 10)
      .then((hash) =>
        User.create({ name, avatar, email, password: hash })
          .then((user) =>
            res.status(201).send({
              name: user.name,
              avatar: user.avatar,
              email: user.email,
            }),
          )
          .catch((err) => {
            console.error(err);
            if (err.name === "ValidationError") {
              return res.status(castError).send({ message: "Invalid data" });
            }
            return res
              .status(defaultError)
              .send({ message: "An error has occurred on the server." });
          }),
      )
      .catch((err) => {
        console.error(err);
        return res
          .status(defaultError)
          .send({ message: "An error has ocurred to the server" });
      });
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(castError)
      .send({ message: "Email and password fields are required" });
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      return res.send({ token });
    })
    .catch((err) => {
      if (err.message === "Incorrect email or password") {
        return res
          .status(unauthorizedError)
          .send({ message: "Incorrect email or password" });
      }
      return res
        .status(defaultError)
        .send({ message: "An error has ocurred to the server" });
    });
};

const getCurrentUser = (req, res) => {
  const userId = req.user._id;
  User.findById(userId)
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(documentNotFoundError).send({ message: err.message });
      }
      if (err.name === "CastError") {
        return res.status(castError).send({ message: "Invalid data" });
      }
      return res
        .status(defaultError)
        .send({ message: "An error has occurred on the server." });
    });
};

const updateUser = (req, res) => {
  const { name, avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .orFail()
    .then(() => res.send({ name, avatar }))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(documentNotFoundError).send({ message: err.message });
      }
      if (err.name === "ValidationError") {
        return res.status(castError).send({ message: "Invalid data" });
      }
      return res
        .status(defaultError)
        .send({ message: "An error has occurred on the server." });
    });
};

module.exports = { createUser, getCurrentUser, login, updateUser };
