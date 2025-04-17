const Message = require("../models/messageModel");

const handleFetchUserMessages = async(req, res)=>{
    const userId = req.params.userId;
    // console.log(userId);
    if(!userId) return res.status(400).json({error:"UserId required!"});

    try {
        const messages = await Message.find({
            $or: [
              { reciever: userId },
              { sender: userId }
            ]
          });
        //   console.log(messages)
          return res.status(200).json({message:"Messages Fetched Successfully", data:{messages}});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error:"Server Error!"});
    }
};

module.exports = {handleFetchUserMessages};