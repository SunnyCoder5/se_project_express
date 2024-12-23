const ClothingItem = require("../models/clothingItem");
const { BadRequestError } = require("../utils/errors/BadRequestError");
const { NotFoundError } = require("../utils/errors/NotFoundError");
const { ForbiddenError } = require("../utils/errors/ForbiddenError");

const getItems = (req, res) => {
  ClothingItem.find({})
    .then((clothingItems) => res.send(clothingItems))
    .catch((err) => {
      console.error(err);
      return next(err);
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
        return next(new BadRequestError(err.message));
      }
      return next(err);
    });
};

const deleteItem = (req, res) => {
  const { itemId } = req.params;
  ClothingItem.findById(itemId)
    .orFail()
    .then((item) => {
      if (!item.owner.equals(req.user._id)) {
        return next(new ForbiddenError("You can't delete this item"));
      }

      return ClothingItem.findByIdAndRemove(itemId)
        .orFail()
        .then((deletedItem) => res.send(deletedItem))
        .catch((err) => {
          console.error(err);
          if (err.name === "CastError") {
            return next(new ForbiddenError("Invalid ID format"));
          }
          if (err.name === "DocumentNotFoundError") {
            return next(new NotFoundError(err.message));
          }
          return next(error);
        })

        .catch((err) => {
          console.error(error);
          if (err.name === "CastError") {
            return next(new BadRequestError("Invalid ID format"));
          }

          if (err.name === "DocumentNotFoundError") {
            return next(new NotFoundError("Item not found"));
          }
          return next(error);
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
        return next(new NotFoundError("Item not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid data"));
      }
      return next(error);
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
        return next(new NotFoundError(err.message));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid data"));
      }
      return next(error);
    });

module.exports = { getItems, createItem, deleteItem, likeItem, dislikeItem };
