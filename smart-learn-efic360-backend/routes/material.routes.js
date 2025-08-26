const express = require("express");
const { upload } = require("../middlewares/upload.middleware");
const controller = require("../controllers/material.controller");

const router = express.Router();

router.get("/", controller.index);
router.post("/", upload.single("file"), controller.create);
router.put("/:id", upload.single("file"), controller.update);
router.delete("/:id", controller.destroy);

module.exports = router;
