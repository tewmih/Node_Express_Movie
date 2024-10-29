
class CustomErrorHadnler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
        this.isOperational = true;

        // Capture the stack trace for this error instance
        Error.captureStackTrace(this, this.constructor);
    }
}
module.exports = CustomErrorHadnler;
