import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {AuthService} from "./auth.service";
import {ForgotPassword, SignIn, SignUp} from "./dto/auth.dto";
import {isSuccessResponse} from "../../utils/interface/response";
import {User} from "../../database/entities/User.entity";

export class AuthController {
    constructor(public authService: AuthService) {}

    async signUp(body: SignUp, res: Response): Promise<void> {
        const errors = await validate(plainToInstance(SignUp, body));
        if (errors.length > 0) {
            const messages = JSON.stringify(errors.map((error) => error.constraints));
            res.status(400).send(messages);
            return;
        }

        const result = await this.authService.signUp(body);
        res.status(result.status).json(result);
    }

    async verify(req: Request, res: Response): Promise<void> {
        const token = req.query.token;
        const result = await this.authService.verify(token as string);
        res.status(result.status).json(result);
    }

    async login(req: Request, res: Response): Promise<void> {
        const data = req.body;
        const errors = await validate(plainToInstance(SignIn, data));
        if (errors.length > 0) {
            const messages = JSON.stringify(errors.map((error) => error.constraints));
            res.status(400).send(messages);
            return;
        }
        const result = await this.authService.login(data);
        if (isSuccessResponse(result)) {
            const user = result.data.user as User;
        }
        res.status(result.status).json(result);
    }

    async forgot(body: ForgotPassword, res: Response): Promise<void> {
        const errors = await validate(plainToInstance(ForgotPassword, body));
        if (errors.length > 0) {
            const messages = JSON.stringify(errors.map((error) => error.constraints));
            res.status(400).send(messages);
            return;
        }
        const result = await this.authService.forgotPassword(body);
        res.status(result.status).json(result);
    }

    async reset(req: Request, res: Response): Promise<void> {
        const token = req.query.token;
        const result = await this.authService.resetPassword(token as string);
        res.status(result.status).json(result);
    }

    async activeUser(req: Request, res: Response) {
        const id = req.params.id
        const result = await this.authService.activeUser(id);
        res.status(result.status).json(result);
    }
}
