const router = require("express").Router();
const userRouter = require("./users");
const clothingItemRouter = require("./clothingItems");

router.use("/users", userRouter);
router.use("/clothingItems", clothingItemRouter);

module.exports = router;
