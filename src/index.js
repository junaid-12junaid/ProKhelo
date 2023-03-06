let express=require("express")
let mongoose=require("mongoose")
let route=require("./routes/route")
let app=express()
let dotenv=require("dotenv")
app.use(express.json())
 
dotenv.config()
mongoose.connect(process.env.MONGODB_STR,{
    useNewUrlParser:true
}) 
.then(_=>console.log("DB is Connected"))
.catch(err=>console.log(err))

app.use("/",route)

app.listen(process.env.PORT||3000,()=>{
    console.log("Express app is running on "+process.env.PORT||3000)
})