const User = require('../models/businessOwner')
const CustomError = require('../helpers/customErorr');
require('express-async-errors');


module.exports=async(req,res,next)=>{

    const token = req.headers.authorization;
    if (!token) throw CustomError('Login first', 401, "Login faild ");
    const currentUser = await User.getUserFromToken(token);
    req.user = currentUser;
    next();

}