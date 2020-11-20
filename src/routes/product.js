const express = require("express");
const router = express.Router();
const controller = require("../controllers/productController");
const authService = require("../services/authService");

router.post("/", authService.isAdmin, controller.post);
router.get("/", controller.get);
router.get("/:slug", controller.getBySlug);
router.get("/admin/:id", controller.getById);
router.get("/tags/:tag", controller.getByTag);
router.put("/:id", controller.put);
router.delete("/", controller.delete);

module.exports = router;
