const asyncHandler = require("express-async-handler")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/userModel")

const registerUser = asyncHandler(async (req,res)=>{
    const {username,email,password} = req.body
    if(!username || !email || !password){
        res.status(400)
        throw new Error("All the fields are mandatory")
    }
    const userAvailable = await User.findOne({email})
    if(userAvailable){
        res.status(400)
        throw new Error("User already registered");
    }

    //Hash password
    const hashedPassword = await bcrypt.hash(password,10)
    // console.log("Hashed Password",hashedPassword)

    const user = await User.create({
        username,
        email,
        password: hashedPassword,
    })
    if(user){
        res.status(201).json({_id:user.id,email:user.email})
        console.log("User created",user)
    }else{
        res.status(400)
        throw new Error("User data is not valid")
    }
})

const loginUser = asyncHandler(async (req,res)=>{
    const {email,password} = req.body
    if(!email || !password){
        res.status(400)
        throw new Error("All fields are mandatory")
    }

    const user = await User.findOne({email})

    //compare password with hashedpassword
    if(user && (await bcrypt.compare(password,user.password))){
        const accessToken = jwt.sign(
            {
            user:{
                username:user.username,
                email: user.email,
                id: user.id,
            }
            },
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:"15m"}
    )
        res.status(200).json({accessToken})
    }else{
        res.status(401)
        throw new Error("email or password is not Valid")
    }
})

const currentUser = asyncHandler(async (req,res)=>{
    res.json(req.user)
})

module.exports = {registerUser,loginUser,currentUser}