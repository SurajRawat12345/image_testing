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
/*
router.post('/tweet', checkJwt, checkScopes(['write:tweet']), upload.single('image'), (req, res) => {
  const { text } = req.body;
  const userId = req.user.sub;
  const imageUrl = req.file ? req.file.path : '';
  const tweet = new Tweet({ text: text, userId: userId, imageUrl: imageUrl });
  tweet.save()
    .then(() => res.json({ message: 'Tweet created' }))
    .catch(err => res.status(400).json({ error: err }));
});
router.get('/api/images', async (req, res) => {
    try {
      const result = await cloudinary.api.resources();
      res.json(result.resources);
    } catch (err) {
      console.log(err);
      res.status(500).json({ err: 'Something went wrong' });
    }
  });
*/
const app = express();
const PORT = process.env.PORT || 5000;

mongoose.set('strictQuery', false); 
mongoose.connect(process.env.DB , {useNewUrlParser : true , useUnifiedTopology : true})
.then(console.log("Connected DB"))

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static('public'));

/*
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
*/
app.get("/" , async(req,res) => {
    res.status(200).json("Hello User")
})
//SINGALE IMAGE UPLODING
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
      /*
    try{
        const imageUrl = req.file ? req.file.path : '';
        //req.file
        //console.log(req.file);
        const abc = await imageModel({image: imageUrl}).save();
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
    } */
})

app.get("/get-images" , async(req,res) => {
    try {
        const result = await cloudinary.api.resources();
        res.json(result.resources);
      } catch (err) {
        console.log(err);
        res.status(500).json({ err: 'Something went wrong' });
      }
    /*
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
    }*/
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