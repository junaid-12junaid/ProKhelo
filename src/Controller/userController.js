const userModel = require("../Model/userModel")
const { isValid, isValidName, isvalidEmail, isvalidMobile, isValidPassword,  keyValid, validString } = require('../Validator/validation')


const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')

const { isValidObjectId } = require("mongoose")

const createUser = async function (req, res) {
    try {
        const data = req.body
       
        if (!keyValid(data)) return res.status(400).send({ status: false, message: "Please Enter data to Create the User" })

        const { name, email, phone, password, address } = data

        if (!isValid(name)) return res.status(400).send({ status: false, message: "name is mandatory and should have non empty String" })

        if (!isValidName.test(name)) return res.status(400).send({ status: false, message: "Please Provide name in valid formate and Should Starts with Capital Letter" })

        if (!isValid(email)) return res.status(400).send({ status: false, message: "email is mandatory and should have non empty String" })

        if (!isvalidEmail.test(email)) return res.status(400).send({ status: false, message: "email should be in  valid Formate" })

        if (await userModel.findOne({ email })) return res.status(400).send({ status: false, message: "This email is already Registered Please give another Email" })

        if (!isValid(phone)) return res.status(400).send({ status: false, message: "Phone is mandatory and should have non empty Number" })

        if (!isvalidMobile.test(phone)) return res.status(400).send({ status: false, message: "please provide Valid phone Number with 10 digits starts with 6||7||8||9" })

        if (await userModel.findOne({ phone })) return res.status(400).send({ status: false, message: "This Phone is already Registered Please give another Phone" })

        if (!isValid(password)) return res.status(400).send({ status: false, message: "Password is mandatory and should have non empty String" })

        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "please provide Valid password with 1st letter should be Capital letter and contains spcial character with Min length 8 and Max length 15" })


        const encyptPassword = await bcrypt.hash(password, 10)

        let obj = {
            name, email, phone, password: encyptPassword
        }

        const newUser = await userModel.create(obj)

        return res.status(201).send({ status: true, message: "User created successfully", data: newUser })

    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}

const loginUser = async function (req, res) {
    try {
        let data = req.body
        const { email, password } = data
        //=====================Checking the validation=====================//
        if (!keyValid(data)) return res.status(400).send({ status: false, msg: "Email and Password Required !" })

        //=====================Validation of EmailID=====================//
        if (!email) return res.status(400).send({ status: false, msg: "email is required" })


        //=====================Validation of Password=====================//
        if (!password) return res.status(400).send({ status: false, msg: "password is required" })

        //===================== Checking User exsistance using Email and password=====================//
        const user = await userModel.findOne({ email: email })
        if (!user) return res.status(400).send({ status: false, msg: "Email is Invalid Please try again !!" })

        const verifyPassword = await bcrypt.compare(password, user.password)

        if (!verifyPassword) return res.status(400).send({ status: false, msg: "Password is Invalid Please try again !!" })


        //===================== Creating Token Using JWT =====================//
        const token = jwt.sign({
            userId: user._id.toString()
        }, "this is a private key", { expiresIn: '25h' })

        res.setHeader("x-api-key", token)

        let obj = {
            userId: user._id,
            token: token
        }

        res.status(200).send({ status: true, message: "User login successfull", data: obj })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}




let getById = async (req, res) => {
    try {

        const UserIdData = req.params.id

        const decodedToken = req.decodedToken

        if (!isValidObjectId(UserIdData)) return res.status(400).send({ status: false, message: 'userId is not valid' })

        let user = await userModel.findOne({_id:UserIdData,isDeleted:false})

        if (!user) return res.status(404).send({ status: false, messgage: 'user not found' })

        if (UserIdData !== decodedToken) return res.status(401).send({ status: false, messgage: 'Unauthorized access!' })

        return res.status(200).send({ status: true, message: 'User profile details', data: user })
    }
    catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}



let getAllUsers = async (req, res) => {
    try {

        let user = await userModel.find({isDeleted:false})

        if (user.length==0) return res.status(404).send({ status: false, messgage: 'users not found' })

        return res.status(200).send({ status: true, message: 'Users profile details', data: user })
    }
    catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}




const updateUser = async function (req, res) {
    try {
        let userId = req.params.id
        let body = req.body
        const decodedToken = req.decodedToken

        
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'userId is not valid' })

        let user = await userModel.findById(userId)

        if (!user) return res.status(404).send({ status: false, messgage: ' user not found' })

        if (userId !== decodedToken) return res.status(403).send({ status: false, messgage: `Unauthorized access!, You can't update user profile` })

        if (!keyValid(body)) return res.status(400).send({ status: false, message: "Please Enter data to update the User" })

        const data = {}
        

        const { name, email, phone, password} = body

        if (!validString(name)) return res.status(400).send({ status: false, message: "name can not be empty" })
        if (name) {
            if (!isValidName.test(name)) return res.status(400).send({ status: false, message: "Please Provide fname in valid formate and Should Starts with Capital Letter" })
            data.name = name
        }


        if (!validString(email)) return res.status(400).send({ status: false, message: "Email can not be empty" })
        if (email) {
            if (!isvalidEmail.test(email)) return res.status(400).send({ status: false, message: "email should be in  valid Formate" })
            if (await userModel.find({ email })) return res.status(400).send({ status: false, message: `Unable to update email. ${email} is already registered.` })
            data.email = email
        }

        if (!validString(phone)) return res.status(400).send({ status: false, message: "phone can not be empty" })
        if (phone) {
            if (!isvalidMobile.test(phone)) return res.status(400).send({ status: false, message: "please provide Valid phone Number with 10 digits starts with 6||7||8||9" })
            if (await userModel.findOne({ phone })) return res.status(400).send({ status: false, message: `Unable to update phone. ${phone} is already registered.` })
            data.phone = phone
        }

        if (!validString(password)) return res.status(400).send({ status: false, message: "password can not be empty" })
        if (password) {
            if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "please provide Valid password with 1st letter should be Capital letter and contains spcial character with Min length 8 and Max length 15" })
            data.password = await bcrypt.hash(password, 10)
        }


        const newUser = await userModel.findOneAndUpdate({_id:userId,isDeleted:false}, data, { new: true })

        if(!newUser) res.status(404).send({ status: false, message: "no User found to update" })
 
        return res.status(200).send({ status: true, message: "User updated successfully", data: newUser })

    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}


let deleteUserById= async function(req, res) {
    try {
        let userId = req.params.id
        const decodedToken = req.decodedToken
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'userId is not valid' })

        let data = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!data) return res.status(404).send({ status: true, message: "No userId found or may be deleted already" });

        if (userId !== decodedToken) return res.status(401).send({ status: false, messgage: 'Unauthorized access!' })

        await userModel.findByIdAndUpdate(userId, { isDeleted: true})
        return res.status(200).send({ status: true, message: "user Deleted Successfully" });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { createUser, loginUser, updateUser, getById ,getAllUsers,deleteUserById}