let mongoose=require("mongoose")

let userSchema=new mongoose.Schema({
    name: {
        type:String, 
        required:true,
        trim:true
    },
    email: {
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    phone: {
        type:String, 
        required:true,
        unique:true,
        trim:true
    }, 
    password: {
        type:String, 
        required:true,
        trim:true
    },// encrypted password
    isDeleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

module.exports=mongoose.model("user",userSchema)