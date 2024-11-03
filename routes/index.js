const router = require("express").Router();
const userRouter = require("./users");
const clothingItemRouter = require("./clothingItems");
const { castError, documentNotFoundError } = require("../utils/errors");

router.use("/users", userRouter);
router.use("/items", clothingItemRouter);
router.use((req, res) => {
  res
    .status(documentNotFoundError)
    .send({ message: "Requested resource not found" });
});

module.exports = router;
