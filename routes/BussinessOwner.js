const BusinessOwner=require('../models/businessOwner');
const express = require('express');
const authenticationMiddleware=require('../middlewares/authentication');
const validationMiddleWare = require('../middlewares/validationMiddleware');
require('express-async-errors');
const router = express.Router();
const {check} = require('express-validator');

//----------------------get all users-----------------------------//
router.get('/getAllusers',authenticationMiddleware,async(req,res,next)=>{
    
const users=await User.find();
res.json(users)
   
});
//-----------------get user by id ---------------------------//
 router.get('/:id',authenticationMiddleware,async(req,res,next)=>{
    const{id}=req.params;
    //const users=await User.find();
     const user= await User.findById(id)
     res.json(user)
    
    
     });



//---------------------------UpdateUser---------------------------//
    // router.patch('/Edit/:id',authenticationMiddleware,validationMiddleWare(
    //     check('password')
    //     .isLength({
    //         min: 5
    //     })
    //     .withMessage('must be at least 5 chars long')
    //     .matches(/\d/)
    //     .withMessage('must contain a number')
    // ),
    //  async (req, res, next) => {
    //         id = req.user.id;
    //     const {
    //         username,
    //         password,
    //         age,
    //         email
    //     } = req.body;
    //     const user = await User.findByIdAndUpdate(id, {
    //         $set: {
    //             username,
    //             password,
    //             age,
    //             email
    //         }
    //     }, {
    //         new: true,
    //         runValidators: true,
    //         omitUndefined: true
    //     });
    //     res.status(200).json(user)
    // })
    

    
///-----------------------Register-----------------//
router.post('/register',validationMiddleWare(
    check('password')
    .isLength({
        min: 4
    })
  

  
), async (req, res, next) => {

    const {
        firstName,
        lastName,
        password,
        country,
        paymentData,
        email,
     
    } = req.body;
    const user = new BusinessOwner({

        firstName,
        lastName,
        password,
        country,
        paymentData,
        email,
    });

    await user.save();
    res.json(user);
})




    ////------------------------------login-----------------------//
    router.post('/login', async(req,res,next)=>{
     const{email,password}=req.body;
     const user=await BusinessOwner.findOne({email});
       if(!user) throw new Error('wrong email or password');
        const isMatch=await user.comparePassword(password);
        if(!isMatch) throw new Error('wrong email or password');
        
        const token=await user.generateToken();
        
        if(!token) throw new Error('token  cant created');
   
        res.json({token,user});
       
      
       
        })
        
            
    

      

module.exports=router;

