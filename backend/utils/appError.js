class AppError extends Error {
    constructor(message, statusCode) {
        super(message); // Call the parent constructor (Error)

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // Mark as operational errors (trusted errors you want to send to client)

        Error.captureStackTrace(this, this.constructor); // Capture stack trace, excluding the AppError constructor call
    }
}

export default AppError;
