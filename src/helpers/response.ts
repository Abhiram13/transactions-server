import {Response} from 'express';

/**
 * takes a function as parameter and executes it, if error occurs, then catches it
 * apis throws errors in unexpected situations and writing try catch for every api method is hectic
 * @param callback methods with api functionalities will be passed as callback to this method, this method acts as global error handler
 */
export async function ApiErrorHandler(res: Response, callback: () => Promise<void>) {
   try {
      await callback();
   } catch (e: any) {
      ApiResponse<string>(e.message, res, 500);
   }
}

export function ApiResponse<T>(body: T, res: Response, statusCode: number = 200) {
   res.status(200).send({statusCode: statusCode, result: body}).end();
}