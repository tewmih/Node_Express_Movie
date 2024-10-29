
const CustomErrorHandler = require("../Utility/CustomErrorHandler");

const devErrors = (error, res) => {
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        stacktrace: error.stack,
        error: error
    });
};

const prodErrors = (error, res) => {
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message
        });
    } else {
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong. Please try again later.'
        });
    }
};

const totalErrorHandler = (err,res, statusCode,next) => {
    // return next(new CustomErrorHandler('Token has expired. Please login again', 402));
    // const error=new CustomErrorHandler('Token has expired. Please login again', 401)
    // return next(error)
    return res.status(statusCode).json({
        status:'fail',
        message:err
    })
};

module.exports = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'fail';

    // Check if it's a TokenExpiredError
  

    if (process.env.NODE_ENV === 'development') {
        devErrors(error, res);
    } else if (process.env.NODE_ENV === 'production') {
        if (error.name == 'TokenExpiredError') return totalErrorHandler('Token has expired, please login again',res, 401,next);
        if (error.code == 11000) return totalErrorHandler('the same data for unique data.like email...',res, 400,next);
        if (error.name == 'CastError') return totalErrorHandler('cast error occured',res, 400,next);
        if (error.name == 'JsonWebTokenError') return totalErrorHandler('invalid token,please login again',res, 400,next);
        if (error.errors.confirmPassword.name == 'ValidatorError') return totalErrorHandler('confirmPassword: enter the same password',res, 400,next);
        
        prodErrors(error, res);
    }
};

