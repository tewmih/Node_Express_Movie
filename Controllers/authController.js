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

exports.signup=asyncErrorHandler(async (req,res)=>{
   const user=await userModel.create(req.body);

   const token=tokenServer(user._id)
   const options={
    maxAge: 600000,
    httpOnly:true,
    // secure:true
   }
      if(process.env.NODE_ENV !== 'production'){
        options.secure = true;
       }
res.cookie('token', token,options)

    
   user.password=undefined;
   user.active=undefined;
   user.__v=undefined;
   user.role=undefined;
   req.user = user;
        res.status(201).json({
            status:'success',
            token,
            data:{
                user
            }
        })


})


exports.login=asyncErrorHandler(async(req,res,next)=>{
    const {email,password}=req.body;
    // const email=req.body.email
    // const password=req.body.password
    if(!email || !password){
        const err= new customErrorHandler('email and/or password is not filled',400)
        return next(err)
    }
  
 const user=await userModel.findOne({email}).select(['password','active','name','email']);//email check
//  const Dbpassword=user.password?user.passwod:'nopassword'
 if(!user.active){
    const err =new customErrorHandler('user is deactivated',404);
    return next(err);
   }
const ismatch= await user.comparePassword(password,user.password)//password check
 if(!user || !ismatch){
    const err=new customErrorHandler('email and/or password incorrect',404)
    return next(err)
 }

 const token=tokenServer(user._id)
 req.user = user
 res.status(200).json({
    status:'success',
    token,
    data:{
        name:user.name,
        id:user._id,
        email:user.email
        // user
    }

 })

})

exports.protect=asyncErrorHandler(async (req,res,next)=>{
    // 1.check if tolen exists
    let storedToken=req.headers.authorization//i exhusted using Authorization instead of authorzation
    let token=''
    if(storedToken && storedToken.startsWith('Bearer')){
       token = storedToken.split(' ')[1]
    } 
    if(!storedToken){
        next(new customErrorHandler('login first',401))
    }
    // verify the token
    const decodedToken=await util.promisify(jwt.verify)(token,process.env.SECRET_STR)
    // check whether the user exists
    const user=await userModel.findOne({_id:decodedToken.id}).select('active')
    if(!user.active){
        const err=new customErrorHandler('user has been deleted',404);
        return next(err);
    }

    if(!user){
        const err=new customErrorHandler('user with this token is not found ',404)
        next(err)
    }
     // check password change check to prevent using token
    const ispswdChanged=await user.isPasswordChanged(decodedToken.iat)
    if(ispswdChanged){
        const err=new customErrorHandler('the password is changed recently. please login again',401)
        next(err)
    }
   
    // allow the user
    req.user=user
    next()
})

exports.restrict=(role)=>{
    return(req,res,next)=>{
        if(req.user.role!=role){
            const err=new customErrorHandler("you haven't an authorization to perform this task",403)
            next(err)
        }
        next()
    }
    
}

exports.forgetPassword=asyncErrorHandler(async (req,res,next)=>{
    const user =await userModel.findOne({email:req.body.email});
    
    if(!user){
        const err=new customErrorHandler('user not found',404);
        next(err);
    }
    // create resetToken object
    const resetToken= await user.resetTokenGenerator();
    await user.save({validateBeforeSave:false});

    // send reset password email
    const resetUrl=`${req.protocol}://${req.get('host')}/api/users/reset:${resetToken}`;
    const message=`Click this link ${resetUrl} to reset the password and the link expires in ten( ${(user.resetTokenExpires*1)/1000/60/10}) minutes`
    try{
        await sendEmail({
            email:user.email,
            subject:'passoword reset link ',
            message,
        })

         res.status(200).json({
            status: 'success',
            data:{message:'passoword reset link sent to your email address'}
         })
    }catch(err){
      user.resetToken=undefined;
      user.resetTokenExpires=undefined;
      const error=new customErrorHandler(err,500)
      return next(error)
    }

})

exports.reset = asyncErrorHandler(async (req, res, next) => {
    // 1. Hash the incoming token
    const hashedToken = crypto.createHash('sha256').update(req.params.token,'utf-8').digest('hex');
    // 2. Find the user with the matching hashed token and check if the token hasn't expired
    const user = await userModel.findOne({
        resetToken: hashedToken,  
        resetTokenExpires: { $gt: Date.now() }  
    });

    if (!user) {
        return next(new customErrorHandler('Invalid reset token or it has expired', 404));
    }

    // 3. Reset password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordChangedAt = Date.now();

    // 4. Clear the reset token and its expiry
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    await user.save();

    // 5. Log the user in, send JWT
    const token = tokenServer(user._id);
    req.user = user;

    res.status(200).json({
        status: 'success',
        token,
        data: {
            name: user.name,
            id: user._id,
            message: 'Password changed successfully'
        }
    });
});






// exports.restrict=(...role)=>{
//     return(req,res,next)=>{
//         if(!role.includes(req.user.role)){
//             const err=new customErrorHandler("you haven't an authorization to perform this task",403)
//             next(err)
//         }
//         console.log('passed')
//         next()
//     }
    
// }

// exports.forgetPassword=asyncErrorHandler(async (req,res,next)=>{
//     // find the user
//    const user=await userModel.findOne({email:req.body.email})
//    if(!user){
//     const err=new customErrorHandler('user not found',404);
//     next(err);
//    }
//    // generate reset token
//    const resetToken=user.getResetToken()
//    await user.save({validateBeforeSave:false})

//    // send the reset token
//    const resetUrl=`http://localhost:3000/api/v1/password/reset/${resetToken}`
//    const message=`click this link to reset your password ${resetUrl}`

//    try{
//     await sendEmail({
//        to:user.email,
//        subject:'password reset token',
//        text:message
//     })
//     res.status(200).json({
//         status:'success',
//         message:'reset token sent to your email'
//     })
//    }catch(error){
//     user.resetPasswordToken=null
//     user.resetPasswordExpire=null
//     await user.save({validateBeforeSave:false})
//     const err=new customErrorHandler('there was an error sending email',500)
//     next(err)
//    }

    
// })
// exports.resetPassword=asyncErrorHandler(async (req,res,next)=>{
//     // get user by token
//     const hashedToken=crypto.createHash('sha256').update(req.params.token).digest('hex')
//     const user=await userModel.findOne({resetPasswordToken:hashedToken,resetPasswordExpire:{$gt:Date.now()}})
//     if(!user){
//         const err=new customErrorHandler('token is invalid or expired',400)
//         return next(err)
//     }
//     // set new password
//     user.password=req.body.password
//     user.resetPasswordToken=null
//     user.resetPasswordExpire=null
//     await user.save()
//     res.status(200).json({
//         status:'success',
//         message:'password has been reset'
//     })
// })