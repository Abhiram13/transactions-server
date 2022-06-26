//@ts-check
import {ITransactionPayload, ITransaction, IDueDetails} from "../types/transactions.dto";
import {Query} from "../helpers/query";
import {QueryResult} from "pg";
import {Request, Response} from 'express';

export async function ListofTransactions(req: Request, res: Response) {
   const transactions: ITransaction[] = await (await Query(`SELECT amount, type, description, due, id, to_char(date, 'YYYY-MM-DD') as date FROM transactions`)).rows;
   res.send(transactions).end();
}

async function addDues(transactionId: number, dueDetails: IDueDetails): Promise<boolean> {
   const {from_person, to_person} = dueDetails;
   const insertDue = `INSERT INTO dues (from_person, to_person, status, transaction_id) VALUES ('${from_person}', '${to_person}', 'active', ${transactionId}) RETURNING d_id`;
   const result: QueryResult<any> = await Query(insertDue);
   if (result.rowCount && result.rows.length > 0) {
      return true;
   }

   return false;
}

export async function addTransaction(req: Request, res: Response): Promise<boolean> {
   const payload: ITransactionPayload = req.body;
   const insertQuery = `
      INSERT INTO transactions 
      (amount, type, date, description, due, from_bank_id, category_id, to_bank_id) 
      VALUES (${payload.amount}, '${payload.type}', '${payload.date}', '${payload.description}', ${payload.due}, ${payload.from_bank_id}, ${payload.category_id}, ${payload.to_bank_id}) 
      RETURNING id`;
   const result: QueryResult<any> = await Query(insertQuery);

   if (result.rowCount && result.rows.length > 0) {
      if (payload.due) {
         const transactionId: number = result.rows[0].id;
         return await addDues(transactionId, payload.due_details);
      }

      return true;
   }

   return false;
}