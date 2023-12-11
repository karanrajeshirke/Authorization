const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const engine = require('ejs-mate');


// database connection 

mongoose.connect("mongodb://127.0.0.1:27017/auth")
.then(()=>{
    console.log("DB Connection Successfull")
})
.catch((err)=>{
    console.log(err);
})

// schema for user 
const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
},{timestamps:true})

// model for user 

const userModel = mongoose.model("users",userSchema)


// endpoints 

const app = express();
app.set("view engine","ejs");
app.engine('ejs', engine);

app.use(express.json())
app.use(express.urlencoded({extended:true}));

app.post("/register",(req,res)=>{

    try
    {
        let user = req.body;
        console.log(req.body);

        bcrypt.genSalt(10,(err,salt)=>{
            if(!err)
            {
                bcrypt.hash(user.password,salt,(err,hpass)=>{
                    if(!err)
                    {
                       user.password = hpass;
    
                       userModel.create(user)
                        .then((doc)=>{
                            res.status(201).send({message:"User Registration Successfull"})
                        })
                        .catch((err)=>{
                            console.log(err);
                            res.status(500).send({message:"Some Problem"})
                        })
    
                    }
                   
    
                })
            }
        })
    }
    catch(err)
    {
        next(err);
    }


})


// endpoint for login 
app.get('/login',(req,res)=>
{
    //i have rendered an login form here
    res.render("login");
})

app.get('/register',(req,res)=>
{
     //i have rendered an register form here
    res.render("register")
})

app.post("/login",(req,res)=>{

    try
    {
        let userCred=req.body;

        userModel.findOne({email:userCred.email})
        .then((user)=>{
    
           if(user!==null)
           {
            bcrypt.compare(userCred.password,user.password,(err,result)=>{
                if(result===true)
                {
                    // generate a token and send it back 
    
                    jwt.sign({email:userCred.email},"thorabhkey",(err,token)=>{
                        if(!err)
                        {
                            res.send({token:token})
                        }
                        else 
                        {
                            res.status(500).send({message:"Some issue while creating the token please try again"})
                        }
                    })
    
    
                }
                else 
                {
                    res.status(401).send({message:"Incorrect Password"})
                }
            })
           }
           else 
           {
            res.status(404).send({message:"Wrong Email No User found"})
           }
           
    
        })
        .catch((err)=>{
            console.log(err);
            res.send({message:"Some Problem"})
        })
    }
    catch(err)
    {
        next(err);
    }

    

})

app.get('/base',(req,res)=>
{
    //this is home page where anchor tag of login and register is there
    res.render("home");
})


//!sir this is where things are not working when i do login and then go this route its still saying authentication
//!token not provided

app.get("/getdata",verifyToken,(req,res)=>{

    res.send({message:"I am a bad developer with a good heart"});

})


function verifyToken(req,res,next)
{
    try {
        if (req.headers.authorization) {
            let token = req.headers.authorization.split(" ")[1];
            console.log(token);
            jwt.verify(token, "thorabhkey", (err, data) => {
                if (!err) {
                    console.log(data);
                    next();
                } else {
                    res.status(401).send({ message: "Invalid Token, please login again" });
                }
            });
        } else {
            res.status(401).send({ message: "Authentication token not provided, please login" });
        }
    } catch (err) {
        next(err);
    }
    

    
}

app.get('*',(req,res)=>
{
    res.send("does not exixst");
})

app.use((err,req,res,next)=>
{
    res.send("error my brother");
    console.log(err);
})


app.listen(8080,()=>{
    console.log("Server is up and running");
})