require("dotenv").config();
const express= require('express');
const cors = require("cors");
const multer = require('multer');
const mongoose = require('mongoose');
const morgan = require("morgan");
const imageModel = require("./models/imageModel.js");

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.set('strictQuery', false); 
mongoose.connect(process.env.DB , {useNewUrlParser : true , useUnifiedTopology : true})
.then(console.log("Connected DB"))

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static('public'));

const storage = multer.diskStorage({
    destination:'./public/images', //directory (folder) setting
    filename:(req, file, cb)=>{
        cb(null, Date.now()+file.originalname) // file name setting
    }
})

//Upload Setting
const upload = multer({
    storage: storage,
    fileFilter:(req, file, cb)=>{
        if(file.mimetype == 'image/jpeg'|| file.mimetype == 'image/jpg' || 
        file.mimetype == 'image/png' || file.mimetype == 'image/gif')
        {
            cb(null, true)
        }
        else{
            cb(null, false);
            cb(new Error('Only jpeg,  jpg , png, and gif Image allow'))
        }
    }
})

app.get("/" , async(req,res) => {
    res.status(200).json("Hello User")
})
//SINGALE IMAGE UPLODING
app.post('/upload-image', upload.single('file'), async(req, res)=>{
    try{
        req.file
        //console.log(req.file);
        const abc = await imageModel({image: req.file.filename}).save();
        res.status(200).send({
            success : true,
            msg : "Uploaded successfully",
            abc,
        })
    }
    catch(error){
        console.log(error);
        res.status(409).send({
            success : false,
            msg : "Error in uploading image",
            error,
        })
    } 
})

app.get("/get-images" , async(req,res) => {
    try{
        const images = await imageModel.find({});
        res.status(200).send({
            success : true,
            msg : "Fetched Data",
            images,
        })
    }
    catch(error){
        console.log(error);
        res.status(409).send({
            success : false,
            msg : "Error in Fetching image",
            error,
        })
    }
})
app.get("/images/:id" , async(req,res) => {
    try{
        const { id } = req.params.id;
        const oneImage = await imageModel.findOne({image : id});
        res.status(200).send({
            success : true,
            msg : "Fetched Data",
            oneImage,
        })
    }
    catch(error){
        console.log(error);
        res.status(409).send({
            success : false,
            msg : "Error in Fetching image",
            error,
        })
    }
})

app.listen(PORT , () => {
    console.log(`Server is running on port ${PORT}`);
})