import 'dotenv/config';
import express, { Express, NextFunction, Request, Response } from 'express';
import path from 'path';
import {databaseConnection, DatabaseConnection} from "./database/db";
import {wrap} from "./shared/wrapper/wrap";
import logger from "./shared/log/logger";

const port = process.env.PORT;
export const app: Express = express();

// Middleware for parsing HTML forms or URL-encoded format
app.use(
    express.urlencoded({
        extended: true,
    })
);
// Middleware for parsing json objects to request
app.use(express.json());

// app.use(sessionMiddleware);

app.set('views', path.join(__dirname, '../public/views'));
app.set('view engine', 'ejs');
databaseConnection
    .initialize()
    .then(() => {
        const initialize = wrap(databaseConnection, express.Router());
        app.use('', initialize);

        app.listen(port, () => {
            logger.info(`Server is up on ${port as string}! `);
        });
    })
    .catch((e) => {
        logger.error('Error during application initialization', e);
    });
