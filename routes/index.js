const router = require("express").Router();
const userRouter = require("./users");
const clothingItemRouter = require("./clothingItems");
const { NotFoundError } = require("../utils/errors/NotFoundError");
const { login, createUser } = require("../controllers/users");
const auth = require("../middlewares/auth");
const {
  validateUserLogin,
  validateUserInfo,
} = require("../middlewares/validation");

router.post("/signin", validateUserLogin, login);
router.post("/signup", validateUserInfo, createUser);

router.use("/users", auth, userRouter);
router.use("/items", clothingItemRouter);
router.use((req, res, next) => {
  next(new NotFoundError("Requested resource not found"));
});

module.exports = router;
