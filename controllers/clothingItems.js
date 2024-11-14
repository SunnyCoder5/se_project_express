const ClothingItem = require("../models/clothingItem");
const {
  castError,
  documentNotFoundError,
  defaultError,
  forbiddenError,
} = require("../utils/errors");

const getItems = (req, res) => {
  ClothingItem.find({})
    .then((clothingItems) => res.send(clothingItems))
    .catch((err) => {
      console.error(err);
      return res
        .status(defaultError)
        .send({ message: "An error has occurred on the server." });
    });
};

const createItem = (req, res) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;
  ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => {
      res.status(201).send(item);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(castError).send({ message: err.message });
      }
      return res
        .status(defaultError)
        .send({ message: "An error has occurred on the server." });
    });
};

const deleteItem = (req, res) => {
  const itemId = req.params;
  ClothingItem.findById({ _id: itemId })
    .orFail()
    .then((item) => {
      if (!item) {
        return res.status(documentNotFoundError).send({ message: err.message });
      }

      if (!item.owner.equals(req.user._id)) {
        return res
          .status(forbiddenError)
          .send({ message: "You can't delete this item" });
      }

      return ClothingItem.findByIdAndRemove(req.params.itemId)
        .orFail()
        .then((item) => res.send(item))
        .catch((err) => {
          console.error(err);
          if (err.name === "CastError") {
            return res.status(castError).send({ message: err.message });
          }
          if (err.name === "DocumentNotFoundError") {
            return res
              .status(documentNotFoundError)
              .send({ message: err.message });
          }
          return res
            .status(defaultError)
            .send({ message: "An error has ocurred to the server" });
        });
    });
};

const likeItem = (req, res) =>
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .then((item) => res.send(item))
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
        .send({ message: "An error has occurred on the server" });
    });

const dislikeItem = (req, res) =>
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .then((item) => res.status(200).send(item))
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
        .send({ message: "An error has occurred on the server" });
    });

module.exports = { getItems, createItem, deleteItem, likeItem, dislikeItem };
