const Auth=require('../models/auth.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const register = async(req, res)=> {
    try {
        const {username,email,password} = req.body;
        const user = await Auth.findOne({email})
        if(user){
            return res.status(500).json({message :"Bu email hesabı kullanılmaktadır.."})
        }
        if(password.length < 6){
            return res.status(500).json({message :"Parolanız 6 karakterden fazla olmalı.."})

        }
    
        const passwordHash = await bcrypt.hash(password,12)

        const newUser= await Auth.create({username, email, password:passwordHash});
         const userToken = jwt.sign({id: newUser.id}, process.env.SECRET_TOKEN, {expiresIn:'1h'});

         res.status(201).json({
            status:'OK',
            newUser,
            userToken
         });
    } catch (error) {
        return res.status(500).json({message : error.message})
    }
}

const login = async(req, res) =>{
    try {
    const {email, password}= req.body;
    // dışarıdan 1 tane user bul
    const user = await Auth.findOne({email});
    // eğer kayıtlı user yoksa 
    if(!user){
        return res.status(500).json({message:"Böyle bir kullanıcı Bulunamadı..."});
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if(!comparePassword){
        return res.status(500).json({message:"Parolanız Yanlış Lütfen tekrar deneyiniz.."});
    }
    const token = jwt.sign({id: user.id},process.env.SECRET_TOKEN, {expiresIn:'1h'})

    res.status(200).json({
        status: "OK",
        user,
        token
    })
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

module.exports = {register, login}