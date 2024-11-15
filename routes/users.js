const router = require("express").Router();
const { getCurrentUser, updateUser } = require("../controllers/users");

const auth = require("../middlewares/auth");

router.get("/me", auth, getCurrentUser);
router.patch("/me", auth, updateUser);

module.exports = router;
