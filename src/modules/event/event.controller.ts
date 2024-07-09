
import {Request, Response} from 'express';
import {validate} from 'class-validator';
import {plainToInstance} from 'class-transformer';
import {EventService} from "./event.service";
import {AddEventDto, GetEventDto, UpdateEventDto} from "./dto/event.dto";

export class EventController {
    constructor(public eventService: EventService) {
    }

    // Event controller for handle
    async getAllEvents(req: Request, res: Response): Promise<void> {
        const input = req.query;
        const errors = await validate(plainToInstance(GetEventDto, input));
        if (errors.length > 0) {
            const messages = JSON.stringify(errors.map((error) => error.constraints));
            res.status(400).send(messages);
            return;
        }
        const result = await this.eventService.getAllEvents(input as unknown as GetEventDto);
        res.status(result.status).json(result);
    }

    async addEvent(req: Request, res: Response): Promise<void> {
        const input = req.body;
        const errors = await validate(plainToInstance(AddEventDto, input));
        if (errors.length > 0) {
            const messages = JSON.stringify(errors.map((error) => error.constraints));
            res.status(400).send(messages);
            return;
        }
        const result = await this.eventService.addEvent(req.body.user.id, input);
        res.status(result.status).json(result);
    }

    async updateEvent(req: Request, res: Response): Promise<void> {
        const input = req.body;
        const errors = await validate(plainToInstance(UpdateEventDto, input));
        if (errors.length > 0) {
            const messages = JSON.stringify(errors.map((error) => error.constraints));
            res.status(400).send(messages);
            return;
        }
        const result = await this.eventService.updateEvent(input);
        res.status(result.status).json(result);
    }

    async deleteEvent(req: Request, res: Response): Promise<void> {
        const id: string = req.params.id;
        const result = await this.eventService.deleteEvent(id);
        res.status(result.status).json(result);
    }

}

