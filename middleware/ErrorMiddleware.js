import {ApiError} from "../utils/ApiError.js";


export const ErrorMiddleware=(err,req,res, next)=>{
    err.statusCode=err.statusCode || 500;
    err.message= err.message || "Internal server error";

    // wrong mongodb id error
    if(err.name ==="CastError"){
        const message= `Resource not found. Invalid: ${err.path}`;
        err= new ApiError(message, 400);
    }

    // Duplicate key error
    if(err.name ==="RangeError"){
        const message= `Duplicate ${Object.keys(err.keyValue)} entered`;
        err= new ApiError(message, 500)
    }

    // wrong jwt error
    if(err.name=== 'JsonWebTokenError'){
        const message= 'Json web token is invalid, try again';
        err= new ApiError(message, 400);
    }

    // jwt expired error
    if(err.name ==='TokenExpiredError'){
        const message= 'Json web token is expired, try again';
        err= new ApiError(message, 400);
    }

    res.status(err.statusCode).json({
        success:false,
        statusCode:err.statusCode,
        message:err.message,
    })
}
