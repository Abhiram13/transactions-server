//@ts-check
import {ITransactionPayload, ITransaction, IDueDetails} from "../types/transactions.dto";
import {Query} from "../helpers/query";
import {QueryResult} from "pg";
import {Request, Response} from 'express';
// import apiResponse from "../helpers/response";


export async function ListofTransactions(req: Request, res: Response) {
   try {
      const debitSum = `CASE WHEN t.type ILIKE 'debit' THEN amount END`;
      const creditSum = `CASE WHEN t.type ILIKE 'credit' THEN amount END`;
      const subQuery = `SELECT json_build_object('amount', tr.amount, 'description', tr.description, 'type', tr.type) FROM transactions tr WHERE tr.date = t.date`;
      const q = `
         SELECT to_char(date, 'YYYY-MM-DD') as date, COALESCE(SUM(${debitSum}), 0) as debit, COALESCE(SUM(${creditSum}), 0) as credit,
         array(${subQuery}) as transaction FROM transactions t GROUP BY t.date
      `;
      const transactions: ITransaction[] = await (await Query(q)).rows;
      res.send(transactions).end();
   } catch (e: any) {
      res.send(e.message).end();
   }
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