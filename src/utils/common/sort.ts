import {FindManyOptions} from "typeorm";
import {Event} from "../../database/entities/Event.entity";

export function getSortedEvents(sortField = 'startDate', order = 'asc') {
    const options: FindManyOptions<Event> = {
        order: {
            [sortField as keyof Event]: order === 'asc' ? 1 : -1,
        },
    };
    return options
}