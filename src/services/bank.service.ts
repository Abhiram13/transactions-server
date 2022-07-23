//@ts-check
import {Query} from "../helpers/query";
import {Request, Response} from 'express';
import {ApiErrorHandler, ApiResponse} from "../helpers/response";
import {IBank} from "../types/banks.dto";

export async function List(req: Request, res: Response): Promise<void> {
   ApiErrorHandler(res, async function() {
      const mainQuery = `SELECT b_id as id, name, logo FROM bank`;
      const banks: IBank[] = await (await Query(mainQuery)).rows;
      ApiResponse<IBank[]>(banks, res, 200);
   });
}