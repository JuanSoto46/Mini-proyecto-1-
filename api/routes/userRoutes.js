const express = require("express");
const router = express.Router();
const { authRequired } = require("../middlewares/auth");
const UserController = require("../controllers/UserController");

// Protect endpoints with JWT
router.get("/", authRequired, UserController.list);
router.get("/me", authRequired, UserController.me);
router.delete("/me", authRequired, UserController.deleteMe);


router.put("/me", authRequired, UserController.updateMe);

module.exports = router;
