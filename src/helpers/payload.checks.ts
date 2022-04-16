//@ts-check
import {ITransaction} from "../types/transactions.dto";
import {Request, Response} from 'express';

export function AddTransactionCheck(req: Request, res: Response): void {
   const body: ITransaction = req.body;
   
   if (!body.amount) {
      res.status(400).send("Bad Request").end();
      return;
   } else if (!body.category_id) {
      res.status(400).send("Bad Request").end();
      return;
   } else if (!body.date) {
      res.status(400).send("Bad Request").end();
      return;
   } else if (!body.description) {
      res.status(400).send("Bad Request").end();
      return;
   } else if (body.due === undefined || body.due === null) {
      res.status(400).send("Bad Request").end();
      return;
   } else if (!body.from_bank_id) {
      res.status(400).send("Bad Request").end();
      return;
   } else if (!body.type) {
      res.status(400).send("Bad Request").end();
      return;
   } else if (!body.to_bank_id) {
      res.status(400).send("Bad Request").end();
      return;
   }
}