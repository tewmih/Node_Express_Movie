const mongoose=require('mongoose')
const validator=require('validator')
const bcryptjs=require('bcryptjs')
const bcrypt=require('bcrypt')
const crypto=require('crypto')
const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,'name is a requred field'],
        // validate:validator.isAlpha,
    },
    email:{
        type:String,
        required:[true,'email is a required field'],
        unique:true,
        lowercase:true,
        validate:validator.isEmail
    },
    password:{
        type:String,
        required:[true,'password is a reqired field'],
        minlength:6,
        select:false
    },
    confirmPassword:{
        type:String,
        required:[true,'password confirmation is a required field'],
        validate:{
            // only works for create() and save() methods
            validator:function(value){
                return value===this.password
            },
            message:'enter the same password'
        }
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    active:{
        type:Boolean,
        default:true,
        select:false
    },
    photo:String,
    passwordChangedAt:Date,
    // loginAttempts: {
    //     type:Number,
    //     default:0
    // },
    // lockUntil: {
    //     type:Date,
    //     default:null
    // },
    // lastLogin: {
    //     type:Date,
    //     default:null
    // },
    
    resetToken:String,
    resetTokenExpires:Date,

})
userSchema.pre('save',async function(next){
    if(!this.isModified('password'))return next()
    this.password= await bcryptjs.hash(this.password,12)//12 is a cost value but you can use hash values also

    this.confirmPassword=undefined
})
userSchema.pre('find', async function(next){//it creates an error when i use /^find/ instead
    this.find({active:true});
    next();
})
userSchema.methods.comparePassword=async function(userPassword,DBpassword){
   return await bcrypt.compare(userPassword,DBpassword)
}

userSchema.methods.isPasswordChanged=async function(jwtIssuedAt){
    if(this.passwordChangedAt){
        const pswdchangedAt=parseInt(this.passwordChangedAt.getTime()/1000)//millisecond
        return (jwtIssuedAt<pswdchangedAt)
    }
    return false
}
userSchema.methods.resetTokenGenerator= async function(){
   const token= await crypto.randomBytes(32).toString('hex').trim()//reset token
   this.resetToken = crypto.createHash('sha256').update(token,'utf-8').digest('hex');
   this.resetTokenExpires= Date.now()+60*60*1000
//    await this.save()
   return token
}
// userSchema.methods.isAdmin=async function(){
//    return await this.role=='admin'?true:false
// }

const userModel=mongoose.model('userModel',userSchema)

module.exports=userModel