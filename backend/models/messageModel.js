const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    reciever:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    content:{
        type:String,
        required:true
    },
}, {timestamps:true});

const Message = mongoose.model('message', MessageSchema);
module.exports = Message;