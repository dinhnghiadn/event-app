import * as nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import path from 'path';
import { compile } from 'handlebars';
import logger from "../log/logger";

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APPLICATION_PASSWORD,
    },
});

export const sendVerificationEmail = async (
    email: string,
    url: string
): Promise<void> => {
    const filePath = path.join(__dirname, '../email/template/verification.hbs');
    const source = readFileSync(filePath, 'utf-8').toString();
    const template = compile(source);
    const htmlToSend = template({
        email,
        url,
    });
    try {
        await transporter.sendMail({
            from: '"Shopping app" <nghiagbf31@gmail.com>',
            to: email,
            subject: 'Account Verification',
            text: 'Click on the link below to verify your account: ' + url,
            html: htmlToSend,
        });
        logger.info('Verification email sent successfully!');
    } catch (e) {
        logger.error(e)
    }
};

export const sendResetPasswordEmail = async (
    email: string,
    url: string
): Promise<void> => {
    try {
        await transporter.sendMail({
            from: '"Shopping app" <nghiagbf31@gmail.com>',
            to: email,
            subject: 'Password Reset',
            text: 'Click on the link below to verify your account: ' + url,
            html:
                '<b>Hello! </b><br> Welcome back. Click on the link' +
                ' below to reset your password:<br><a  target="_blank"' +
                ' href=' +
                url +
                '>Click' +
                ' me!</a>',
        });
        logger.info('Password reset email sent successfully!');
    } catch (e) {
        logger.error(e);
    }
};

export const sendNewPasswordEmail = async (
    email: string,
    password: string
): Promise<void> => {
    try {
        await transporter.sendMail({
            from: '"Shopping app" <nghiagbf31@gmail.com>',
            to: email,
            subject: 'New Password',
            text: 'Here is your new password, please save it: ' + password,
        });
        logger.info('New password email sent successfully!');
    } catch (e) {
        logger.error(e);
    }
};

