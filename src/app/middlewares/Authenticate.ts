import Middleware from "./Middleware";
import { Request, Response, NextFunction } from "express";
// import * as expressJwt from 'express-jwt'
import { KeyStore } from "../providers/Keystore";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { TokenHandler } from "../providers/TokenHandler";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { Logger } from "../Log";

@injectable()
export default class Authenticate extends Middleware {
    // options: expressJwt.Options
    
    constructor(
        // @inject(TYPES.KeyStore) private keyStore: KeyStore,
        @inject(TYPES.TokenHandler) private tokenHandler: TokenHandler,
        @inject(TYPES.Logger) private logger: Logger
    ) {
        super()
    }

    /**
     * If the user if authenticated, the
     * request object will have a user property
     */
    // handle = this.expressJwtMiddleware()

    handle = async (req, res, next) => {
        let token = this.getTokenFromHeader(req);

        try {
            let payload = token ? await this.tokenHandler.validate(token)
                            : null;
            req.auth = payload;
            // console.log({payload})
        } catch(err) {
            if (err instanceof JsonWebTokenError) {
                // Log the Error
                let { name, message, stack } = err;
                this.logger.error("AUTHENTICATION_ERROR", { name, message, stack, token });
            } else if (err instanceof TokenExpiredError) {
                // Log the Error
                let { name, message, stack } = err;
                this.logger.error("AUTHENTICATION_ERROR", { name, message, stack, token });
            } else {
                throw err;
            }
        }
        
        // console.log({payload})
        next();
    }

    /**
     * Use this in express-jwt if you don't want the 
     * token after 'Bearer' keywork in header.
     * @param req The request object
     * @returns string Token
     */
    getTokenFromHeader(req: Request): string {
        // console.log(req.headers.authorization)
        if ( ! req.headers.authorization ) {
            return null 
        }

        return req.headers.authorization.split(' ')[1]
    } 

}