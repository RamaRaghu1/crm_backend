class ApiError extends Error {
    constructor(
      statusCode,
      message = "Something went wrong",
      errors = [],
      stack = ""
    ) {
      super(message);
      this.statusCode = statusCode;
      this.data = null;
      this.message = message;
      this.success = false;
      this.errors = errors;
  
      // if stack is already present will set the stack as it is
      if (stack) {
        this.stack = stack;
        // or else  generates a new stack trace
      } else {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  
  export  {ApiError};
  