import { NextFunction, Request, Response, Router } from 'express';
import {AuthController} from "./auth.controller";


export class AuthRoutes {
    constructor(private readonly router: Router, public authController: AuthController) {}

    getAuthRoutes(): Router {
        this.router.post('/auth/register', (req: Request, res: Response) =>
            this.authController.signUp(req.body, res)
        );
        this.router.get('/auth/verify', (req: Request, res: Response) =>
            this.authController.verify(req, res)
        );
        this.router.get('/auth/active/:id', (req: Request, res: Response) =>
            this.authController.activeUser(req, res)
        );
        this.router.post('/auth/login', (req: Request, res: Response) =>
            this.authController.login(req, res)
        );
        this.router.post('/auth/forgot', (req: Request, res: Response) =>
            this.authController.forgot(req.body, res)
        );
        this.router.get('/auth/reset', (req: Request, res: Response) =>
            this.authController.reset(req, res)
        );

        return this.router;
    }
}
