const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    content:{
        type:String,
        required:true,
        trim:true,
        maxLength:1000
    },
    messageType:{
        type:String,
        enum:['text', 'image', 'file'],
        default:'text'
    },
    isRead:{
        type:Boolean,
        default:false
    },
    readAt:{
        type:Date
    }
}, {timestamps:true});

const Message = mongoose.model('message', MessageSchema);
module.exports = Message;