require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {connectDB} = require('./config/dbConnection.js');

const userRoute = require('./routes/userRoute.js');

const app = express();
const PORT = process.env.PORT || 3001;

connectDB(process.env.MongoURI);

app.use(cors({
    origin:process.env.FRONTEND_URL,
    methods:["POST", "PUT", "DELETE", "GET"],
    allowedHeaders:["Content-Type", "Authorization"],
    credentials:true
}));

app.use(express.json());
app.use('/api/auth/', userRoute);

app.get('/', (req, res)=>{
    return res.status(200).json({message:"Homepage"});
})

app.listen(PORT, ()=>{
    console.log("Server is runnig on port "+PORT);
})