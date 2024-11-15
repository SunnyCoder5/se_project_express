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
    .then((newItem) => {
      res.status(201).send(newItem);
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
  const { itemId } = req.params;
  ClothingItem.findById(itemId)
    .orFail()
    .then((item) => {
      if (!item.owner.equals(req.user._id)) {
        return res
          .status(forbiddenError)
          .send({ message: "You can't delete this item" });
      }

      return ClothingItem.findByIdAndRemove(itemId)
        .orFail()
        .then((deletedItem) => res.send(deletedItem))
        .catch((error) => {
          console.error(error);
          if (error.name === "CastError") {
            return res.status(castError).send({ message: "Invalid ID format" }); // Return 400 for invalid ID
          }
          if (error.name === "DocumentNotFoundError") {
            return res
              .status(documentNotFoundError)
              .send({ message: error.message });
          }
          return res
            .status(defaultError)
            .send({ message: "An error has occurred on the server" });
        });
    })
    .catch((error) => {
      console.error(error);
      if (error.name === "CastError") {
        return res.status(castError).send({ message: "Invalid ID format" }); // Also handle CastError here
      }
      if (error.name === "DocumentNotFoundError") {
        return res
          .status(documentNotFoundError)
          .send({ message: error.message });
      }
      return res
        .status(defaultError)
        .send({ message: "An error has occurred on the server" });
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
