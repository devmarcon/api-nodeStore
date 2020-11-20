const express = require("express");
const router = express.Router();
const controller = require("../controllers/customerController");
const authService = require("../services/authService");

router.post("/", controller.post);
router.post("/authenticate", controller.authenticate);
router.post("/refresh-token", authService.authorize, controller.refreshToken);
router.get("/", controller.get);

module.exports = router;
