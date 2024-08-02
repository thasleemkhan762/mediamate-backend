const express = require("express");
const dotenv = require("dotenv").config();
const errorHandler = require("./middleware/errorHandler");
const connectDb = require("./config/mongoDbConnection");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");


connectDb();
const app = express();
const port = process.env.PORT || 5000;

app.use(session({
    secret: '123456789',
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: false }  
    cookie: {
        maxAge: 7 * 60 * 60 * 1000,
        // secure: true, // Ensures cookies are only sent over HTTPS
        httpOnly: true, // Prevents client-side access to cookies
        sameSite: 'strict' // Protects against CSRF attacks by only allowing cookies from the same origin
    },
}));

app.use(cors({origin: "http://localhost:3000", credentials: true}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve(__dirname, 'uploads')));

//importing routes
const authRoute = require("./routes/userRoutes");
// const oAuthRouter = require("./oauth");
// const requestRouter = require("./request");

//route setup
app.use("/api/users",authRoute);
///////////////////////////////////////////
// app.use('/oauth', oAuthRouter);
// app.use('/request', requestRouter);

// error handling middleware
app.use(errorHandler);

// start the server
app.listen(port, ()=> {
    console.log(`Server is running on port ${port}`);
});