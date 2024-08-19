const express = require("express");
const dotenv = require("dotenv").config();
const errorHandler = require("./middleware/errorHandler");
const connectDb = require("./config/mongoDbConnection");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const http = require('http');
const socketIo  = require("socket.io");
const Chat = require("./models/chatModel")

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
// const oAuthRouter = require("./oauth");
// const requestRouter = require("./request");
// Middleware to serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


///////////////////////////////////////////
// app.use('/oauth', oAuthRouter);
// app.use('/request', requestRouter);

// error handling middleware
app.use(errorHandler);


// socket
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000", // Replace with your React app's URL
      methods: ["GET", "POST"],
    },
});

//routes
const authRoute = require("./routes/userRoutes");
const chatRoute = require("./routes/chatRoutes");
//route setup
app.use("/api/users",authRoute);
app.use("/api/users/chat",chatRoute);


// Socket.io setup
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinChat', ({ chatId }) => {
        socket.join(chatId);
    });

    socket.on('sendMessage', async (messageData) => {
        const { chatId, senderId, content } = messageData;
        
        // Save the message to the database
        const chat = await Chat.findById(chatId);
        const message = { sender: senderId, content, timestamp: new Date() };
        chat.messages.push(message);
        await chat.save();

        // Emit the message to the chat room
        io.to(chatId).emit('receiveMessage', message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// start the server
server.listen(port, ()=> {
    console.log(`Server is running on port ${port}`);
});