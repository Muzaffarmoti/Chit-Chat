const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const messageRoute = require("./routes/messagesRoute");
const socket = require("socket.io");
const app = express(); 
require("dotenv").config();

// Allowed origins for CORS
const allowedOrigins = [
    "https://chit-chat-21.netlify.app", // Production Netlify URL
    "http://localhost:3000" // Local development
];

// Apply CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin, like mobile apps or curl requests
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
}));

app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoute);

// MongoDB connection
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("DB Connection Successful");
}).catch((err) => {
    console.log(err.message);
});

// Start server
const server = app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
});

// Setup Socket.io with proper CORS for WebSockets
const io = socket(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
    global.chatSocket = socket;

    // Handle adding a user
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log(`User added: ${userId}`);
    });

    // Handle sending messages
    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", data.message);
            console.log(`Message sent to ${data.to}: ${data.message}`);
        } else {
            console.log(`User ${data.to} is not online.`);
        }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
        onlineUsers.forEach((value, key) => {
            if (value === socket.id) {
                onlineUsers.delete(key);
                console.log(`User disconnected: ${key}`);
            }
        });
    });
});
