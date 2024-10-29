const express=require('express')
const authController=require('../Controllers/authController')

const userRouter=express.Router()

userRouter.route('/login').post(authController.login)
userRouter.route('/signup').post(authController.signup);
userRouter.route('/forgot').post(authController.forgetPassword)
userRouter.route('/reset/:token').patch(authController.reset);


module.exports=userRouter