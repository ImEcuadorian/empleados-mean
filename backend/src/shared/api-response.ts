import type { Response } from 'express';

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    errors?: unknown;
}

export const sendSuccess = <T>(
    res: Response,
    statusCode: number,
    message: string,
    data?: T
): void => {

    const response: ApiResponse<T> = {
        success: true,
        message,
        data
    };

    res.status(statusCode).json(response);
};

export const sendError = (
    res: Response,
    statusCode: number,
    message: string,
    errors?: unknown
): void => {

    const response: ApiResponse<never> = {
        success: false,
        message,
        errors
    };

    res.status(statusCode).json(response);
};