import { NextFunction, Request, Response, Router } from 'express';
import {auth} from "../auth/auth";
import {EventController} from "./event.controller";

export class EventRoutes {
    constructor(private router: Router, public eventController: EventController) {}
    getEventRoutes(): Router {

        //Event routes
        this.router.get(
            '/event/list',
            (req: Request, res: Response, next: NextFunction) => auth(req, res, next,this.eventController.eventService.getUserRepository()),
            (req: Request, res: Response) => this.eventController.getAllEvents(req,res)
        );
        this.router.post(
            '/event/add',
            (req: Request, res: Response, next: NextFunction) => auth(req, res, next,this.eventController.eventService.getUserRepository()),
            (req: Request, res: Response) => this.eventController.addEvent(req, res)
        );

        this.router.patch(
            '/event/update',
            (req: Request, res: Response, next: NextFunction) => auth(req, res, next,this.eventController.eventService.getUserRepository()),
            (req: Request, res: Response) => this.eventController.updateEvent(req, res)
        );

        this.router.delete(
            '/event/delete/:id',
            (req: Request, res: Response, next: NextFunction) => auth(req, res, next,this.eventController.eventService.getUserRepository()),
            (req: Request, res: Response) => this.eventController.deleteEvent(req, res)
        );

        return this.router;
    }
}
