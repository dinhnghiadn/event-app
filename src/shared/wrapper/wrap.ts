import { Router } from 'express';

import {AuthService} from "../../modules/auth/auth.service";
import {AuthController} from "../../modules/auth/auth.controller";
import {DatabaseConnection} from "../../database/db";
import {AuthRoutes} from "../../modules/auth/auth.routes";
import {EventService} from "../../modules/event/event.service";
import {EventController} from "../../modules/event/event.controller";
import {EventRoutes} from "../../modules/event/event.routes";

export const wrap = (dataSource: DatabaseConnection, router: Router): Router => {

    // Auth
    const authService = new AuthService(
        dataSource.getRepository('User'),
        dataSource.entityManager
    );
    const authController = new AuthController(authService);
    new AuthRoutes(router, authController).getAuthRoutes();

    // Event
    const eventService = new EventService(
        dataSource.getRepository('User'),
        dataSource.getRepository('Event'),
    );
    const eventController = new EventController(eventService);
    new EventRoutes(router, eventController).getEventRoutes();

    return router;
};
