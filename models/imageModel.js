const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
    image:{
        type : String,
        required : true,
    },
},{timestamps : true})

module.exports = mongoose.model("images" , imageSchema);