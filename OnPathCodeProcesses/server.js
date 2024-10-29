const mongoose=require('mongoose')
const app=require('./Express_server/AppV5')
const dotenv=require('dotenv')


dotenv.config({path:'./config.env'})
// database connection
mongoose.connect(process.env.LOCAL_CONN_STR)
        .then((connObj)=>{
            // console.log(connObj)
            console.log('Database connection succeed! ')
        })
        .catch((error)=>console.log(error))

const DBshchema=mongoose.Schema({
    name:{
        type:String,
        required:true,
        dafault:'Guest'
    },
    sex:{
        type:String,
        required:false,
        default:"unknown",
    },
    age:{
        type:Number,
        required:[true,'age is required field! ']
    }
})
// model
const personalModel=mongoose.model('personalModel',DBshchema)

// creating the document from the model
const personalDocument=new personalModel({
    name:"person1",
    sex:'femalee',
    age:23
})
personalDocument.save()
                .then(doc=>{
                    console.log(doc)
                })
                .catch((error)=>{
                    console.log("found error! ",error)
                })
 


const port=process.env.PORT

app.listen(port,'localhost',()=>{
    console.log('server is running...')
})