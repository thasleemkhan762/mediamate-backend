const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const getUserChats = asyncHandler(async (req, res) => {});

const sendMessage = asyncHandler(async (req, res) => {});

module.exports = { getUserChats, sendMessage };
  