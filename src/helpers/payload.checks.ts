//@ts-check
import {ITransactionPayload} from "../types/transactions.dto";
import {Request, Response, NextFunction} from 'express';

export function AddTransactionCheck(req: Request, res: Response, next: NextFunction): void {
   const body: ITransactionPayload = req.body;
   const _dueCheck: boolean = dueCheck();

   function dueCheck(): boolean {
      if (body.due) {
         if (Object.keys(body.due_details).length === 0 || !body.due_details.from_person || !body.due_details.to_person) {
            return false;
         }
      }

      return true;
   }

   if (!_dueCheck) {
      res.status(400).send("Due details are missing").end();
      return;
   } else if (!body.amount) {
      res.status(400).send("Amount is required").end();
      return;
   } else if (!body.category_id) {
      res.status(400).send("category Id is required").end();
      return;
   } else if (!body.date) {
      res.status(400).send("Date is required").end();
      return;
   } else if (!body.description) {
      res.status(400).send("Description is required").end();
      return;
   } else if (body.due === undefined || body.due === null) {
      res.status(400).send("Due is required").end();
      return;
   } else if (!body.from_bank_id) {
      res.status(400).send("From Bank is required").end();
      return;
   } else if (!body.type) {
      res.status(400).send("Transaction type is required").end();
      return;
   } else if (!body.to_bank_id) {
      res.status(400).send("To Bank is required").end();
      return;
   }

   next();
}