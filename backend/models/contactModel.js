const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true,
    },
    contactId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true,
    },
    contactName:{
        type:String,
        required:true
    },
    contactEmail:{
        type:String,
        required:true
    },
    contactAvatarURL:{
        type:String,
        default:"#"
    },
}, {timestamps:true});

const Contact = mongoose.model('contact', ContactSchema);
module.exports = Contact;