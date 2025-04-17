const Contact = require("../models/contactModel");
const User = require("../models/userModel");

const handleCreateContact = async(req, res)=>{
    const {email} = req.body;
    if(!email) return res.status(400).json({error:"Email is required!!"});

    try {
        const user = await User.findOne({email});
        if(!user) return res.status(404).json({error:"User Doesn't Exist!"});

        const contact = await Contact.create({
            userId:req.user._id,
            contactId:user._id,
            contactName:user.username,
            contactEmail:user.email,
            contactAvatarURL:user.avatarURL,
        });

        return res.status(201).json({message:"Contact Added Successfully!", data:{contact}});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error:"Server Error!"});
    }
};

const handleFetchAllContacts = async(req, res)=>{
    const userId = req.params.userId;
    if(!userId) return res.status(400).json({error:"UserId is required!!"});
    try {
        const contacts = await Contact.find({userId});

        return res.status(200).json({message:"All Contacts Fetched Successfully!", data:{contacts}});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error:"Server Error!"});
    }
}

module.exports = {handleCreateContact, handleFetchAllContacts}