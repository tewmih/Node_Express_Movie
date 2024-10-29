const userModel=require('../Models/userModel')
const asyncErrorHandler=require('../Utility/asyncErrorHandler')
const customErrorHandler=require('../Utility/CustomErrorHandler')
const util=require('util')
const crypto=require('crypto')
const jwt=require('jsonwebtoken')
const sendEmail = require('../Utility/Email')


const tokenServer=(id)=>{
    return (jwt.sign({id},process.env.SECRET_STR,{
        expiresIn:process.env.LOGIN_EXPIRE
       }))
}

exports.findAll=asyncErrorHandler(async (req,res)=>{
    const user =await  userModel.find().select(['name', 'email','role']);
    if(!user){
        const err=new customErrorHandler('no data found',404);
        return next(err);
    }
    res.status(200).json({
        status:'success',
        count:user.length,
        data:{
            user
        }
    })
})

exports.updatePassword=asyncErrorHandler(async (req,res,next)=>{
    // user check
    const user=await userModel.findById(req.user._id).select('password');

    if(!user){
        const err=customErrorHandler('user missing',404);
        return next(err)
    }
    // password check
    const password=req.body.prevPassword;
    const isTheSamePassword=await user.comparePassword(password,user.password)
    if(!isTheSamePassword){
        const err=new customErrorHandler('incorrect password',400);
        return next(err)
    }
//   update the password
user.password=req.body.password;
user.confirmPassword=req.body.confirmPassword;

await user.save();

const token=tokenServer(user._id)

res.status(200).json({
    status:'success',
    data:{
        token,
        message:'you changed your password'
    }
})

})

const allowedObj=(bodyObject,...allowedFields)=>{
    const allowed={}
    Object.keys(bodyObject).forEach(key=>{
        if(allowedFields.includes(key)){
            allowed[key]=bodyObject[key];
        }
    })
    return allowed;
}

exports.updatePersonalData=asyncErrorHandler(async (req,res,next)=>{
    if(req.body.password || req.body.confirmPassword){
        const err=new customErrorHandler("password can't be change through this end point")
        return next(err);
    }
    const allowedFields = allowedObj(req.body,'name','email');
    const user= await userModel.findByIdAndUpdate(req.user._id,allowedFields,{runValidation:true,new:true}).select(['-__v','-_id']);
    // it is not necessary to validate the user.since we login first to chenge
    // const  isSaved=await user.save({runValidationBeforeSave:false});
    res.status(200).json({
        status:'success',
        data:{
            user,
            message:'Changed'
        }
    })
});

exports.deletePerson=asyncErrorHandler(async (req,res,next)=>{
    const user=await userModel.findByIdAndUpdate(req.user._id,{active:false});
    if(!user){
        const err=new customErrorHandler('unable to delete user',400);
        return next(err);
    }
    console.log(user)
    req.user=null;
    res.status(204).json({
        status:'success',
        data:{
            message:'deleted'
        }
    })
})