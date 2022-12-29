const express = require('express')
const app = express()
const path = require('path')
var port = 3000
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./model/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'erhgdkfvkjdg eriu98798t5trruh'

/* app.set('views',__dirname+'/views')
app.engine('html',require('ejs').renderFile) */

function checkEmail (email) {
    let countat = 0;
    let countdot = 0;

    for(let i=1;i<email.length;i++){
        if(email[i] === '@'){
            countat++;
            continue;
        }
        else if(email[i] === '.'){
            countdot++;
            continue;
        }
        var code = email.charCodeAt(i);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
            return false;
        }
        //else return false;
    }

    if(countat == 1 && countdot == 1) return true;
    else return false;
}

mongoose.connect('mongodb://localhost:27017/farmer-login',{
    useNewUrlParser: true,
    useUnifiedTopology:true
})

app.get('/',function(req,res,next){
    res.sendFile(path.join(__dirname,'pages/signup.html'))
})

app.use(express.static(path.join(__dirname,'pages')))
app.use(bodyParser.json())

/* app.get('/',function(req,res,next){
    res.sendFile(path.join(__dirname,'pages/signup.html'))
}) */

app.get('/user',function(req,res,next){
    res.sendFile(path.join(__dirname,'pages/test_home.html'))
})

app.patch('/api/reset',async (req,res) => {
    console.log(req.body)
    var user = await User.updateOne({email:req.body.email},{sona_wheat:0,basmati_rice:0,cotton_seeds:0,sunflower_seeds:0})
    res.json({status:'ok'})
})

app.patch('/api/resettools',async (req,res) => {
    console.log(req.body)
    var user = await User.updateOne({email:req.body.email},{urea:0,neem_urea:0,all_in_one:0,super_axe:0})
    res.json({status:'ok'})
})

app.patch('/api/addcart',async (req,res) => {
    console.log(req.body)
    const {email,productbtn,producttemp} = req.body
    var user
    switch(req.body.productid){
        case 'b1':
            console.log('at')
            user = await User.updateOne({email:email},{$inc:{sona_wheat:req.body.temp}})
            break
        case 'b2':
            console.log('at')
            user = await User.updateOne({email:email},{$inc:{basmati_rice:req.body.temp}})
            break;
        case 'b3':
            console.log('at')
            user = await User.updateOne({email:email},{$inc:{cotton_seeds:req.body.temp}})
            break;
        case 'b4':
            console.log('at')
            user = await User.updateOne({email:email},{$inc:{sunflower_seeds:req.body.temp}})
            break;
    }
    res.json({status:'ok'})
})

app.patch('/api/addcarttools',async (req,res) => {
    console.log(req.body)
    const {email,productbtn,producttemp} = req.body
    var user
    switch(req.body.productid){
        case 'b1':
            console.log('at')
            user = await User.updateOne({email:email},{$inc:{urea:req.body.temp}})
            break
        case 'b2':
            console.log('at')
            user = await User.updateOne({email:email},{$inc:{neem_urea:req.body.temp}})
            break;
        case 'b3':
            console.log('at')
            user = await User.updateOne({email:email},{$inc:{all_in_one:req.body.temp}})
            break;
        case 'b4':
            console.log('at')
            user = await User.updateOne({email:email},{$inc:{super_axe:req.body.temp}})
            break;
    }
    res.json({status:'ok'})
})


app.patch('/api/patch',async (req,res) => {
    console.log(req.body)
    const {email,data} = req.body
    console.log(data)
    const checkuser = await User.findOne({email})
    if(!checkuser) {
        return res.json({status:'error',error:'User doesnt exist'})
    }

    try {
        const user = await User.updateOne({email:email},{$set:{data}})
    } catch (error) {
        console.log(error)
        return res.json({status:'error',error:'Failed to order'})
    }
    res.json({status:'ok'})
})

app.post('/api/login',async(req,res,next)=>{
    console.log(req.body)
    const {email,password} = req.body
    const user = await User.findOne({email}).lean()

    if(!checkEmail(email)) {
        return res.json({status:'error',error:'Enter an email only'})
    }

    if(password.length < 6) {
        return res.json({status:'error',error:'Password too short'})
    }

    if(!user) {
        return res.json({status:'error',error:'Invalid email/password'})
    }

    if(await bcrypt.compare(password,user.password)) {
        const token = jwt.sign({
            id:user._id,
            username:user.email
        }, JWT_SECRET)
        //localStorage.setItem('email',email);
        //res.render('/pages/test_home.html')
        return res.json({status:'ok',data:token})
        //return res.redirect('/user')
    }
    else {
        res.json({status:'error',error:'Invalid email/password'})
    }
    next()
})

app.post('/api/register',async (req,res) =>{
    console.log(req.body)
    const {email,password:plainTextPassword} = req.body

    if(!checkEmail(email)) {
        return res.json({status:'error',error:'Enter an email only'})
    }

    if(plainTextPassword.length < 6) {
        return res.json({status:'error',error:'Password too short'})
    }

    const password = await bcrypt.hash(plainTextPassword,10)

    try {
        const response = await User.create({
            email,
            password,
            sona_wheat:0,
            basmati_rice:0,
            cotton_seeds:0,
            sunflower_seeds:0,
            urea:0,
            neem_urea:0,
            all_in_one:0,
            super_axe:0,

        })
        console.log('User created successfully: ',response)
    } catch(error) {
        console.log(error)
        return res.json({status:'error',error:'User already exists'})
    }
    res.json({status:'ok'})
})

app.listen(port, function(err){
    if (err) console.log(err);
    console.log("Server listening on 3000");
});