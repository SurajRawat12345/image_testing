require("dotenv").config();
const express= require('express');
const cors = require("cors");
const multer = require('multer');
const mongoose = require('mongoose');
const morgan = require("morgan");
const imageModel = require("./models/imageModel.js");
const cloudinary = require('cloudinary').v2;

const storage = multer.diskStorage({
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    }
  });
const upload = multer({ storage: storage });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.set('strictQuery', false); 
mongoose.connect(process.env.DB , {useNewUrlParser : true , useUnifiedTopology : true})
.then(console.log("Connected DB"))

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get("/" , async(req,res) => {
    res.status(200).json("Hello User")
})
//SINGLE IMAGE UPLODING
app.post('/upload-image', upload.single('file'), async(req, res)=>{
    try {
        const result = await cloudinary.uploader.upload(req.file.path);
        //const imageUrl = req.file ? req.file.path : '';
        const abc = await imageModel(
            {image: {
                public_id : result.public_id, 
                url : result.secure_url}
            }).save();
        res.json({ url: result.secure_url  , abc});
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: 'Something went wrong' });
    }
})

app.get("/get-images" , async(req,res) => {
    try {
        const result = await cloudinary.api.resources();
        res.json(result.resources);
      } catch (err) {
        console.log(err);
        res.status(500).json({ err: 'Something went wrong' });
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