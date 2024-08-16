const express = require("express");
const router = express.Router();

const { getUserChats, sendMessage } = require("../controllers/chatControllers");

router.route("/:id").get( getUserChats );
router.route("/messages").post( sendMessage );

module.exports = router;