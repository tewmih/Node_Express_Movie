const express=require('express')
// const MoviesRouter=require('../Routs/Router')  //version one
const MoviesRouter=require('../Routs/movieRouterV2')
const userRouter = require('../Routs/userRoute')
const authRouter = require('../Routs/authRoute')
const ErrorController=require('../Controllers/ErrorController')
const customErrHandler=require('../Utility/CustomErrorHandler')
const rateLimiter=require('express-rate-limit')//to limit ip from unlimitted requests
const helmet=require('helmet')//security headers
const sanitizer=require('express-mongo-sanitize')
const xss=require('xss-clean')
const hpp=require('hpp')



const app=express()
// security headers
app.use(helmet())
// rate limit
const limiter=rateLimiter({
    max:1000,
    windowMs:15*60*1000,
    message:'Too many requests from this IP, please try again in 15 minutes'
})

app.use('/api/',limiter);

app.use(express.json({limit:'10kb'}))
// afrer recieving the data we sanitize it
app.use(sanitizer());
app.use(xss());// to sanitize any user input
app.use(hpp({
    whitelist:['name', 'email'] //to get one in a or fasion if not it throws err in multi parameter of the same or different
}));// to prevent http parameter pollution

// serving static files from public folder
app.use(express.static('./public'))
app.use('/api/v1/users',userRouter)
app.use('/api/v1/auths',authRouter)
app.use('/api/v1/movies',MoviesRouter)//for movie modal
// for all unsuccessfull routes we excute this middleware
app.all('*',(req,res,next)=>{// default route for unsuccessful request
                // 1
    // res.status(404).json({
    //     status:'fail',
    //     message:`unable to find the provided url ${req.originalUrl} in the server`
    // })
            // 2
    // using global error handling
        // const err=new Error(`unable to find the provided url ${req.originalUrl} in the server`);
        // err.statusCode=404;
        // err.status='failed'

    // using custom error Handler
    const err=new customErrHandler(`unable to find the provided url ${req.originalUrl} in the server`,404)

    next(err)
})
// Global Error handling
app.use(ErrorController)


module.exports=app