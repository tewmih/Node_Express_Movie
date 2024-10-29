const mongoose=require('mongoose')
const dotenv=require('dotenv')
const app=require('./Express_server/AppV4')


dotenv.config({path:'./config.env'})

const port=process.env.PORT

// database connection
mongoose.connect(process.env.LOCAL_CONN_STR)
        .then((connObj)=>{
            // console.log(connObj)
            console.log('Database connection succeed! ')
        }).then((err)=>{
           app.listen(port,'localhost',()=>{
            console.log('server is running...')
           })
        })
        .catch((error)=>console.log(error))


process.on('unhandledRejection',(err)=>{
    console.log(err.name,err.message)

    server.close(()=>{
        process.exit(1)
    })
})