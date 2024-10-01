const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const messageRoute = require("./routes/messagesRoute");
const socket = require("socket.io");
const app = express(); 
require("dotenv").config();

const allowedOrigins = [
    "https://chit-chat-21.netlify.app", // Add your Netlify URL
    "http://localhost:3000" // Local development
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

app.use(cors());
app.use(express.json() );

app.use("/api/auth",userRoutes);
app.use("/api/messages",messageRoute);


mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("DB Connection Successful");
})
.catch((err)=>{
    console.log(err.message);
}) 

const server = app.listen(process.env.PORT,()=>{
    console.log(`Server Started on port ${process.env.PORT}`);
});

// const io = socket(server,{
//     cors:{
//         // origin: "http://localhost:3000",
//         // // origin: "https://chit-chat-21.netlify.app/",
//         origin: process.env.NODE_ENV === "production"
//         ? "https://66f9a61eab61c2448d2c3e7f--chit-chat-21.netlify.app"
//         : "http://localhost:3000",
//         credentials: true,
//     },
// });

const io = socket(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});

global.onlineUsers = new Map();

io.on("connection",(socket)=>{
    global.chatSocket = socket;
    socket.on("add-user",(userId)=>{
        onlineUsers.set(userId,socket.id);
        console.log(`User added: ${userId}`);
    });

    socket.on("send-msg",(data)=>{
        const sendUserSocket = onlineUsers.get(data.to);
        if(sendUserSocket){   
            onsole.log(`Message sent to ${data.to}: ${data.message}`); // Log for debugging
        } else {
            console.log(`User ${data.to} is not online.`); // Log if user is offline
        }
    });
    socket.on("disconnect", () => {
        onlineUsers.forEach((value, key) => {
            if (value === socket.id) {
                onlineUsers.delete(key);
                console.log(`User disconnected: ${key}`); // Log for debugging
            }
        });
    });
})




