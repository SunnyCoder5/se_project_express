const router = require("express").Router();
const { getCurrentUser, updateUser } = require("../controllers/users");
const { validateUpdateUser } = require("../middlewares/validation");

const auth = require("../middlewares/auth");

router.get("/me", auth, getCurrentUser);
router.patch("/me", validateUpdateUser, updateUser);

module.exports = router;
