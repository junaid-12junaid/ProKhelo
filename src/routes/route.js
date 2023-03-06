let express=require("express")
let router=express.Router()
let {authentication}=require("../MiddleWare/auth")
let { createUser, loginUser, updateUser, getById ,getAllUsers,deleteUserById}=require("../Controller/userController")


//User Routes

router.post("/user/register",createUser)
router.post("/user/login",loginUser)

router.get("/user/getDocID/:id",authentication,getById)
router.get("/user/getDocs",getAllUsers)
router.put("/user/update/:id",authentication,updateUser)
router.delete("/user/delete/:id",authentication,deleteUserById)



router.all("/*/",(req,res)=>{
    return res.status(404).send("Page not Found")
})


module.exports=router