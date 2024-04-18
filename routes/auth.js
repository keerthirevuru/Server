const express=require('express')
const router = express.Router()
const User =require('../models/User')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Fetchuser = require('../middleware/Fetchuser')

const jwt_secret="Keerthirevuru"
// Route 1:Create user using post :"api/auth/CreateUser" and does not req auth
router.post('/CreateUser',[
    body('name','Enter a valid name').isLength({min:3}),
    body('email','enter a valid email').isEmail(),
    body('password','password should be min 5 length').isLength({min:5})
  
  ], async (req,res)=>{
    let success=false
//If there are errors, return bad request
  const error = validationResult(req);
    if(!error.isEmpty())
    {
        return res.status(400).json({success,error:error.array()});
    }
    //check weather the user exists already with email id
    try {
    let user = await User.findOne({email:req.body.email});
    console.log(user)
    if(user)
    {
        return res.status(400).json({success,error:"Sorry user with this email already is there]"})
    }
    const salt = await bcrypt.genSalt(10);
    const SecPass= await bcrypt.hash(req.body.password,salt) 
      //create new user
     user = await User.create(
        {
            name:req.body.name,
            password:SecPass,
            email:req.body.email,
        }
    )
    //.then(user=>res.json(user))
    //.catch(err=>console.log(err))
   // res.json({error:'Please enter a unique value for email'})
   const data={
     user:{
       id:user.id
     }
   }
       const auth_token= jwt.sign(data,jwt_secret)
       success=true
      // console.log(auth_token)
   res.json({success,auth_token})

  } catch(error)
   {
     console.error(error.massage)
     res.status(500).send('Some error is there')
   }
      
})



//Route 2:authenticate user using post :"api/auth/login" and does not req auth
router.post('/login',[
  body('email','enter a valid email').isEmail(),
  body('password','password can not be blank').exists(),

], async (req,res)=>{
  //If there are errors, return bad request
  const error = validationResult(req);
  let success=false
    if(!error.isEmpty())
    {
        return res.status(400).json({error:error.array()});
    }
    const {email,password}=req.body  // taking out from body
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        success=false
          return res.status(400).json({success, error: "Wrong email" });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        success=false
          return res.status(400).json({success, error: "Wrong password" });
      }
  
      const data = {
          user: {
              id: user.id
          }
      };
  
      const auth_token = jwt.sign(data, jwt_secret);
      console.log(auth_token);
      success=true
      res.json({success, auth_token });
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal error occurred');
  }
})


//Route 3:get logged in  user details using  post :"api/auth/getuser" log in required
router.post('/getuser',Fetchuser,async (req,res)=>{
try {
  userId=req.user.id
  const user = await User.findById(userId).select("-password")
  res.send(user)
  
} catch (error) {
  console.error(error.massage);
      res.status(500).send('Internal error occurred');
  
}
})
module.exports=router