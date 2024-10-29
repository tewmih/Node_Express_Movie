const mongoose=require('mongoose')
const fs =require('fs')
const validator=require('validator')

const DBschema=mongoose.Schema({
    name:{
        type:String,
        required:true,
        // dafault:'Guest',
        maxlength:[100,'name must be less than 100 characters'],//for string types
        minlength:[4,'name must be greater than 4 characters'],
        validate:[validator.isAlpha,'name must contain only alphabetes']
    },
    sex:{
        type:String,
        required:false,
        default:"unknown",
    },
    age:{
        type:Number,
        required:[true,'age is required field! ']
    },
    salary:{
        type:Number,
        required:[true,'price is a required field'],
        // max:[1000000,'salary greater than 1 million is most likely immposible'],
        // min:[150,'salary less than 150 most likely immposible'],//max and min are used for number and date types
        // or you can use custom validators
        validate:{validator:function(value){
            return(value>=150&&value<=1000000)
        },
        message:'salary must be between 150 and 1000000'
    }
    },
    certificate:{
        type:[String],
        default:'not sertified yet',
        enum:{values:["Graphics Designer","Web Developer","Programmer","Software Engineer","Network Manager","Content Creator"],
              message:'not allowed to selelct non existing certeficate'
        }
    },
    createdBy:String,
    createdAt:{
        type:Date,
        default:Date.now()
    },
    searched:Date,
    founded:Date
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}  //i haven't seen any change if it left
})
// vertualization property
DBschema.virtual('Net salary').get(function(){
    return this.salary*0.85;
})
// Document middleware
// pre save action

DBschema.pre('save',function(next){
    this.createdBy='tewuhbo'
    next()
})
// post save
DBschema.post('save',function(doc,next){
    fs.writeFileSync('./Log/logfile.txt',`this doc is wtitten by ${doc.name}\n`,{flag:'a'},'utf-8',(error)=>{
         console.log(error)
    })
     next()
})
// querry middleware
DBschema.pre('find',function(next){
    this.find({salary:{$gte:55000}})
    this.searched=Date.now()

    next()
})
DBschema.post('find',function(docs,next){ //to use to any type of find use post/pre(/^find/)
    this.find({salary:{$lte:59000}})
    this.founded=Date.now()
    fs.writeFileSync('./Log/logfile.txt',`it took ${this.founded-this.searched} milliseconds\n`,{flag:'a'},'utf-8',(error)=>{
        console.log(error)
   })
    next()
})
// to do data handling before aggregation
DBschema.pre('aggregate',function(next){
    this.pipeline().unshift({$match:{salary:{$lte:50000}}})
    next()
})
// model
const personalModel=mongoose.model('personalModel',DBschema)

module.exports=personalModel