import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";

@ValidatorConstraint({ name: 'isStartDateBeforeEndDate', async: false })
export class IsStartDateBeforeEndDate implements ValidatorConstraintInterface {
    validate(startDate: string, args: ValidationArguments) {
        const [relatedPropertyName] = args.constraints;
        const dueDate = (args.object as any)[relatedPropertyName];
        if (dueDate) {
            return new Date(startDate) <= new Date(dueDate);
        }
        return true
    }

    defaultMessage(args: ValidationArguments) {
        return 'Start date must be before or equal end date.';
    }
}