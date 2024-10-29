const express=require('express');
const userController=require('../Controllers/userContoller');
const authController=require('../Controllers/authController');


const userRouter=express.Router();




userRouter.route('/updatePassword').patch(authController.protect,userController.updatePassword)
userRouter.route('/updatePersonalData').patch(authController.protect,userController.updatePersonalData)
userRouter.route('/deletePerson').delete(authController.protect,userController.deletePerson)
userRouter.route('/findAll').get(authController.protect,userController.findAll)

module.exports=userRouter