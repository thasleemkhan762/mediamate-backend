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
const Chat = require("./models/chatModel");
const bodyParser = require('body-parser')

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

app.use(cors({
    origin: ["https://mediamate-frontend.vercel.app", "https://mediamate-frontend-nh6t.vercel.app"],
    credentials: true
}));



app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve(__dirname, 'uploads')));



// error handling middleware
app.use(errorHandler);


// socket
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: ["https://mediamate-frontend.vercel.app", "https://mediamate-frontend-nh6t.vercel.app"],
        methods: ["GET", "POST"],
        credentials: true
    },
});

app.get('/',(req, res) => {
    res.send('Hello from auth server!');
})

// Middleware to parse the raw body for Stripe webhooks
app.use('/api/users/payments/webhook', bodyParser.raw({ type: 'application/json' }));

//routes
const userRoute = require("./routes/userRoutes");
const chatRoute = require("./routes/chatRoutes");
const authRoute = require("./routes/authRouter");
const paymentRoute = require("./routes/paymentRoutes");
//route setup
app.use("/api/users",userRoute);
app.use("/api/users/chat",chatRoute);
app.use("/auth",authRoute);
app.use("/api/users/payments",paymentRoute);


// Socket.io setup
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinChat', ({ chatId }) => {
        socket.join(chatId);
    });

    socket.on('sendMessage', async (messageData) => {
        try {
            const { chatId, senderId, content, recipientId } = messageData;

            // Update or create the chat document
            const chat = await Chat.findOneAndUpdate(
                { users: { $all: [recipientId, senderId] } },
                { $push: { messages: { sender: senderId, content, timestamp: new Date() } } },
                { upsert: true, new: true }
            );

            // console.log("Updated chat:", chat);
            // console.log("chat id is:", chatId);

            // Emit the message to the chat room
            io.to(chatId).emit('receiveMessage', { sender: senderId, content, timestamp: new Date() });
        } catch (error) {
            console.error("Error in sendMessage:", error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// start the server
server.listen(port, ()=> {
    console.log(`Server is running on port ${port}`);
});