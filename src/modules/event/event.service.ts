import {MongoRepository} from "typeorm";
import {User} from "../../database/entities/User.entity";
import {ErrorResponse, SuccessResponse} from "../../utils/interface/response";
import {Event} from "../../database/entities/Event.entity";
import {AddEventDto, GetEventDto, UpdateEventDto} from "./dto/event.dto";
import logger from "../../shared/log/logger";
import {getPagination} from "../../utils/common/pagination";
import {getSortedEvents} from "../../utils/common/sort";
import {ObjectId} from "mongodb";


export class EventService {
    constructor(
        private readonly userRepository: MongoRepository<User>,
        private readonly eventRepository: MongoRepository<Event>,
    ) {
    }

    // User service for admin

    getUserRepository() {
        return this.userRepository
    }

    async getAllEvents(input: GetEventDto): Promise<SuccessResponse | ErrorResponse> {
        try {
            const pagination = getPagination(input.limit, input.page);
            const sort = getSortedEvents(input.sortField,input.order)
            const now = new Date().toISOString();
            const listEvent = await this.eventRepository.find({
                where: input.isEnd == 'true' ? {
                    dueDate:  {
                        $lte : now
                    }
                } : {},
                skip: pagination.skip,
                take: pagination.take,
                ...sort
            });
            return {
                success: true,
                status: 200,
                message: 'Get event list successfully!',
                data: {
                    listEvent
                },
            };
        } catch (e) {
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            };
        }
    }

    async addEvent(
        userId: string,
        input: AddEventDto,
    ): Promise<SuccessResponse | ErrorResponse> {
        try {
            let event = this.eventRepository.create({
                ...input,
            });
            await this.eventRepository.save(event)
            return {
                success: true,
                status: 201,
                message: 'Create event successfully!',
                data: {
                    event
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

    async updateEvent(
        input: UpdateEventDto,
    ): Promise<SuccessResponse | ErrorResponse> {
        try {
            const objectId = new ObjectId(input.id);
            const filteredData: Partial<UpdateEventDto> = {
                name: input.name,
                description: input.description,
                startDate: input.startDate,
                dueDate: input.dueDate
            };
            Object.keys(filteredData).forEach(key => filteredData[key as keyof UpdateEventDto] === undefined && delete filteredData[key as keyof UpdateEventDto])
            const result = await this.eventRepository.updateOne({
                _id: objectId
            },
                {
                    $set: filteredData,
                })
            if (result.matchedCount === 0) {
                return {
                    success: false,
                    status: 404,
                    message: 'Event not found',
                }
            }
            return {
                success: true,
                status: 200,
                message: 'Update event successfully!',
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

    async deleteEvent(id: string): Promise<SuccessResponse | ErrorResponse> {
        try {
            const objectId = new ObjectId(id);
            const deleteResult = await this.eventRepository.deleteOne({
                _id: objectId
            });
            if (!deleteResult.deletedCount) {
                return {
                    success: false,
                    status: 404,
                    message: 'Event not found!',
                };
            }

            return {
                success: true,
                status: 200,
                message: 'Delete event successfully!',
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
