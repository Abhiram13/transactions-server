//@ts-check
import {Query} from "../helpers/query";
import {Request, Response} from 'express';
import {ApiErrorHandler, ApiResponse} from "../helpers/response";
import {ICategory} from "../types/categories.dto";

export async function List(req: Request, res: Response): Promise<void> {
   ApiErrorHandler(res, async function() {
      const mainQuery = `SELECT c_id as id, category FROM categories`;
      const categories: ICategory[] = await (await Query(mainQuery)).rows;
      ApiResponse<ICategory[]>(categories, res, 200);
   });
}