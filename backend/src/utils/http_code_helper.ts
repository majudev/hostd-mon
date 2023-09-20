import { Router, Request, Response } from 'express';

export function please_log_in(res: Response){
    res.status(401).json({
        status: "error",
        message: "please log in",
    }).end();
}

export function check_login(res: Response): boolean{
    if(!res.locals.authenticated){
        please_log_in(res);
        return false;
    }
    return true;
}

export function fail_missing_params(res: Response, missingFields: String[], message: String | null){
    const msg = missingFields.join(', ')

    res.status(400).json({
        status: "error",
        message: (message !== null) ? message : "please provide missing fields: " + msg,
        missing: missingFields,
    }).end();
}

export function fail_no_permissions(res: Response, message: String){
    res.status(403).json({
        status: "error",
        message: message,
    }).end();
}

export function fail_entity_not_found(res: Response, message: String){
    res.status(404).json({
        status: "error",
        message: message,
    }).end();
}

export function fail_internal_error(res: Response, message: String){
    res.status(500).json({
        status: "error",
        message: message,
    }).end();
}

export function fail_duplicate_entry(res: Response, duplicateField: String, message: String | null){
    res.status(409).json({
        status: "error",
        message: (message !== null) ? message : "database already contains duplicate value of field " + duplicateField + ", which should be unique",
        duplicate: duplicateField,
    }).end();
}