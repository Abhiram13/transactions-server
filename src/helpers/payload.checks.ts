//@ts-check
import {ITransactionPayload} from "../types/transactions.dto";
import {Request, Response, NextFunction} from 'express';
import {ApiResponse} from "../helpers/response";

export function AddTransactionCheck(req: Request, res: Response, next: NextFunction): void {
   const body: ITransactionPayload = req.body;
   const _dueCheck: boolean = dueCheck();

   function dueCheck(): boolean {
      if (body.due) {
         if (!("due_details" in body) || Object.keys(body.due_details).length === 0 || !body.due_details.from_person || !body.due_details.to_person) {
            return false;
         }
      }

      return true;
   }

   if (!_dueCheck) {
      ApiResponse<string>("Due details are missing", res, 400);
      return;
   } else if (!body.amount) {
      ApiResponse<string>("Amount is required", res, 400);      
      return;
   } else if (!body.category_id) {
      ApiResponse<string>("category Id is required", res, 400);      
      return;
   } else if (!body.date) {
      ApiResponse<string>("Date is required", res, 400); 
      return;
   } else if (!body.description) {
      ApiResponse<string>("Description is required", res, 400);      
      return;
   } else if (body.due === undefined || body.due === null) {
      ApiResponse<string>("Due is required", res, 400);      
      return;
   } else if (!body.from_bank_id) {
      ApiResponse<string>("From Bank is required", res, 400);      
      return;
   } else if (!body.type) {
      ApiResponse<string>("Transaction type is required", res, 400);      
      return;
   } else if (!body.to_bank_id) {
      ApiResponse<string>("To Bank is required", res, 400); 
      return;
   }

   next();
}