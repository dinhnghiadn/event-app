import {IsDateString, IsDefined, IsNotEmpty, IsOptional, Validate} from 'class-validator';
import {IsStartDateBeforeEndDate} from "../../../utils/validator/date-validator";

export class GetEventDto {
    @IsOptional()
    isEnd: string;

    @IsOptional()
    limit: number;

    @IsOptional()
    page: number;

    @IsOptional()
    sortField: string;

    @IsOptional()
    order: string;
}

export class AddEventDto {
    @IsDefined()
    @IsNotEmpty()
    name: string;

    @IsDefined()
    @IsNotEmpty()
    description: string;

    @IsDateString({}, { message: 'Invalid date format. Please provide a valid date string.' })
    @Validate(IsStartDateBeforeEndDate, ['dueDate'], { message: 'Start date must be before or equal end date.' })
    startDate: string;

    @IsDateString({}, { message: 'Invalid date format. Please provide a valid date string.' })
    dueDate: string;
}

export class UpdateEventDto {
    @IsDefined()
    @IsNotEmpty()
    id: string;

    @IsOptional()
    name: string;

    @IsOptional()
    description: string;

    @IsDateString({}, { message: 'Invalid date format. Please provide a valid date string.' })
    @Validate(IsStartDateBeforeEndDate, ['dueDate'], { message: 'Start date must be before or equal end date.' })
    @IsOptional()
    startDate: string;

    @IsDateString({}, { message: 'Invalid date format. Please provide a valid date string.' })
    @IsOptional()
    dueDate: string;
}