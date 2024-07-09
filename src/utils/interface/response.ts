export interface SuccessResponse {
    success: boolean;
    status: number;
    data?: any;
    message?: string;
}

export interface ErrorResponse {
    success: boolean;
    status: number;
    message?: string;
}

export function isSuccessResponse(object: any): object is SuccessResponse {
    return object.success === true;
}
