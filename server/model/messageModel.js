const mongoose = require("mongoose");
const usersModel = require("./usersModel");

const messageSchema = new mongoose.Schema({
   message: {
    text:{
        type: String,
        required: true,
    },
   },
   users: Array,
   sender:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "USer",
    required: true,
   },
},
{
    timestamps: true,
});
module.exports= mongoose.model("Messages",messageSchema);