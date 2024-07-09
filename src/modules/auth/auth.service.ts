import {EntityManager, MongoRepository} from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {ErrorResponse, SuccessResponse} from "../../utils/interface/response";
import {User} from "../../database/entities/User.entity";
import {UserStatus} from "../../utils/enum/user";
import {ForgotPassword, SignIn, SignUp} from "./dto/auth.dto";
import {sendNewPasswordEmail, sendResetPasswordEmail, sendVerificationEmail} from "../../shared/email/email";
import {RESET_PASSWORD_TOKEN_EXPIRE} from "../../utils/const/jwt";
import logger from "../../shared/log/logger";
import {ObjectId} from "mongodb";

const { APP_URL, JWT_VERIFY, JWT_RESET, JWT_SECRET } = process.env;

export class AuthService {
    constructor(
        public userRepository: MongoRepository<User>,
        private readonly entityManager: EntityManager
    ) {}

    async createUser(data: SignUp): Promise<User> {
        const user = this.userRepository.create(data);
        return await this.userRepository.save(user);
    }

    async findUserByUsernameEmail(username?: string, email?: string ): Promise<User | null> {
        return await this.userRepository.findOneBy({
            $or: [
                { email },
                { username }
            ]
        });
    }

    async signUp(data: SignUp): Promise<SuccessResponse | ErrorResponse> {
        try {
        const existUser = await this.findUserByUsernameEmail(data.username, data.email);
        if (existUser) {
            return {
                success: false,
                status: 400,
                message: existUser.email == data.email ? 'Email has been taken!' : 'Username has been taker',
            };
        }
        const createdUser = await this.createUser(data);
        const payload = { email: data.email, created: new Date().toString() };
        const verifyToken = jwt.sign(payload, process.env.JWT_VERIFY as string, {
            expiresIn: '1h',
        });
        const verifyUrl = `${
            APP_URL as string
        }auth/verify?token=${verifyToken}`;
        await sendVerificationEmail(data.email, verifyUrl);
        return {
            success: true,
            status: 201,
            message: 'Create user successfully!',
            data: {
                user: createdUser
            },
        };
        } catch (e) {
          logger.error(e)
          return {
            success: false,
            status: 500,
            message: 'Error occur!',
          };
        }
    }

    async verify(token: string): Promise<SuccessResponse | ErrorResponse> {
        try {
            console.log(token)
            const decode = jwt.verify(token, JWT_VERIFY as string);
            const email = (decode as JwtPayload).email;
            const user = await this.userRepository.findOne({ where: { email } });
            if (user === null) {
                return {
                    success: false,
                    status: 404,
                    message: 'User not found!',
                };
            }
            if (user.status === UserStatus.Active) {
                return {
                    success: false,
                    status: 400,
                    message: 'User has already verified!',
                };
            }
            user.status = UserStatus.Active;
            const verifiedUser = await this.userRepository.save(user);
            const payload = { username: user.username, sub: user._id };
            const accessToken = jwt.sign(payload, JWT_SECRET as string, {
                expiresIn: '7d',
            });
            return {
                success: true,
                status: 200,
                message: 'Verify user successfully!',
                data: {
                    user: verifiedUser,
                    token: accessToken
                },
            };
        } catch (e) {
            logger.error(e)
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            };
        }
    }

    async login(data: SignIn): Promise<SuccessResponse | ErrorResponse> {
        try {
            let user = await this.findUserByUsernameEmail(data.username);
            if (user === null) {
                return {
                    success: false,
                    status: 400,
                    message: 'User not found ',
                };
            }
            switch (user.status) {
                case UserStatus.NotVerified:
                    return {
                        success: false,
                        status: 400,
                        message: 'User are not verified yet!',
                    };
                case UserStatus.Blocked:
                    return {
                        success: false,
                        status: 400,
                        message: 'You are blocked. Contact' + ' admin for more information!',
                    };
            }
            const result = await bcrypt.compare(data.password, user.password);
            if (!result) {
                return {
                    success: false,
                    status: 401,
                    message: 'Wrong password. Please try again!',
                };
            }

            const payload = { username: user.username, sub: user._id };
            const accessToken = jwt.sign(payload, JWT_SECRET as string, {
                expiresIn: '7d',
            });
            user.status = UserStatus.Active;
            user = await this.userRepository.save(user);
            return {
                success: true,
                status: 200,
                message: 'Login successfully!',
                data: {
                    user,
                    token: accessToken
                },
            };
        } catch (e) {
            logger.error(e)
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            };
        }
    }

    async forgotPassword(body: ForgotPassword): Promise<SuccessResponse | ErrorResponse> {
        try {
            const user = await this.findUserByUsernameEmail(undefined, body.email);
            if (user === null) {
                return {
                    success: false,
                    status: 400,
                    message: 'There are no user with this email!',
                };
            }
            const payload = { email: user.email, created: new Date().toString() };
            const resetToken = jwt.sign(payload, process.env.JWT_RESET as string, {
                expiresIn: RESET_PASSWORD_TOKEN_EXPIRE,
            });
            user.resetToken = resetToken;
            await this.userRepository.save(user);
            const resetUrl = `${APP_URL as string}auth/reset?token=${resetToken}`;
            await sendResetPasswordEmail(user.email, resetUrl);
            return {
                success: true,
                status: 200,
                message: 'Check your email for password reset!',
            };
        } catch (e) {
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            };
        }
    }

    async resetPassword(token: string): Promise<SuccessResponse | ErrorResponse> {
        try {
            const decode = jwt.verify(token, JWT_RESET as string);
            const email = (decode as JwtPayload).email;
            const user = await this.userRepository.findOne({ where: { email } });
            if (user == null) {
                return {
                    success: false,
                    status: 404,
                    message: 'User not found!',
                };
            }
            if (user.resetToken !== token) {
                return {
                    success: false,
                    status: 401,
                    message: 'Invalid token!',
                };
            }
            const newPassword = crypto.randomBytes(12).toString('hex');
            user.password = newPassword;
            await this.userRepository.save(user);
            await sendNewPasswordEmail(user.email, newPassword);
            return {
                success: true,
                status: 200,
                message: 'A new password has sent to your email. Please' + ' check it!',
            };
        } catch (e) {
            logger.error(e)
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            };
        }
    }

    async activeUser(id: string) {
        try {
            const objectId = new ObjectId(id);
            const user = await this.userRepository.findOne({where: {_id: objectId}});
            if (user === null) {
                return {
                    success: false,
                    status: 404,
                    message: 'User not found!',
                };
            }
            if (user.status === UserStatus.Active) {
                return {
                    success: false,
                    status: 400,
                    message: 'User has already verified!',
                };
            }
            user.status = UserStatus.Active;
            const verifiedUser = await this.userRepository.save(user);
            const payload = {username: user.username, sub: user._id};
            const accessToken = jwt.sign(payload, JWT_SECRET as string, {
                expiresIn: '7d',
            });
            return {
                success: true,
                status: 200,
                message: 'Verify user successfully!',
                data: {
                    user: verifiedUser,
                    token: accessToken
                },
            };
        } catch (e) {
            logger.error(e)
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            };
        }
    }
}
