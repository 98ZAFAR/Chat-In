const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        trim:true,
        minLength:2,
        maxLength:30
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        match:[/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password:{
        type:String,
        minLength:6
    },
    avatarURL:{
        type:String,
        default:"#"
    },
    googleId:{
        type:String,
        sparse:true
    },
    isOnline:{
        type:Boolean,
        default:false
    },
    lastSeen:{
        type:Date,
        default:Date.now
    },
    bio:{
        type:String,
        maxLength:150,
        default:""
    }
}, {timestamps:true});

const User = mongoose.model('user', UserSchema);
module.exports = User;