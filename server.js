const express = require("express");
const connectDb = require("./config/mongoDbConnection");
const dotenv = require("dotenv").config();
const bodyparser = require("body-parser");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")

connectDb();
const app = express();
app.use(cors());

const port = process.env.PORT || 5000;

app.use(bodyparser.json());

//importing routes
const authRoute = require("./routes/authRoutes");

//route setup
app.use("/api/users",authRoute);

// error handling middleware
app.use(errorHandler);

// start the server
app.listen(port, ()=> {
    console.log(`Server is running on port ${port}`);
});