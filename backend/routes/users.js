const express = require("express");
const router = express.Router();
const usersCtrl = require("../controllers/users");
const verifyToken = require("../middleware/verifyToken");

router.post("/signup", usersCtrl.signup);
router.post("/login", usersCtrl.login);
router.put("/me", verifyToken, usersCtrl.updateProfile);
router.delete("/me", verifyToken, usersCtrl.deleteProfile);

module.exports = router;
