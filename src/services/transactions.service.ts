//@ts-check
import {ITransactionPayload, ITransaction, IDueDetails} from "../types/transactions.dto";
import {Query} from "../helpers/query";
import {QueryResult} from "pg";
import {Request, Response} from 'express';
import {ApiErrorHandler, ApiResponse} from "../helpers/response";
import * as fs from 'fs';

interface ICsvData {
   date: string;
   credit: number;
   debit: number;
   category: string;
   description: string;
   from_bank: string;
   to_bank: string;
   actual_debit: number;
   actual_credit: number;
}

export async function ListofTransactions(req: Request, res: Response) {
   ApiErrorHandler(res, async () => {
      const debitSum = `CASE WHEN t.type ILIKE 'debit' THEN amount END`;
      const creditSum = `CASE WHEN t.type ILIKE 'credit' THEN amount END`;
      const subQuery = `SELECT json_build_object('id', tr.id, 'amount', tr.amount, 'description', tr.description, 'type', tr.type) FROM transactions tr WHERE tr.date = t.date`;
      const mainQuery = `
         SELECT to_char(date, 'YYYY-MM-DD') as date, COALESCE(SUM(${debitSum}), 0)::int as debit, COALESCE(SUM(${creditSum}), 0)::int as credit,
         array(${subQuery}) as transactions FROM transactions t GROUP BY t.date
      `;
      const transactions: ITransaction[] = await (await Query(mainQuery)).rows;
      ApiResponse<ITransaction[]>(transactions, res, 200);
   });
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

export async function addTransaction(req: Request, res: Response): Promise<void> {
   ApiErrorHandler(res, async () => {
      const payload: ITransactionPayload = req.body;
      const insertQuery = `
         INSERT INTO transactions (amount, type, date, description, due, from_bank_id, category_id, to_bank_id) 
         VALUES (${payload.amount}, '${payload.type}', '${payload.date}', '${payload.description}', ${payload.due}, ${payload.from_bank_id}, ${payload.category_id}, ${payload.to_bank_id}) 
         RETURNING id`;
      
      const result: QueryResult<any> = await Query(insertQuery);

      if (result.rowCount && result.rows.length > 0) {
         if (payload.due) {
            const transactionId: number = result.rows[0].id;
            const isDueAdded: boolean = await addDues(transactionId, payload.due_details);

            isDueAdded
               ? ApiResponse<string>("Transaction and due successfully added", res, 200)
               : ApiResponse<string>("Transaction is successfully added but adding due is failed", res, 300);
            
            return;
         }

         ApiResponse<string>("Transaction successfully added", res, 200);
         return;
      }

      ApiResponse<string>("Adding transaction failed", res, 400);
      return;
   });   

}

export async function csvToJson(req: Request, res: Response): Promise<void> {
   return ApiErrorHandler(res, async () => {
      var data: string = fs.readFileSync("FILE.csv", "utf-8");
      var array: string[] = data.split("\r\n"); 
      var csv: ICsvData[] = [];
      for (let i = 1; i < array.length; i++) {
         csv.push(parse(array[i].split(",")));
      }

      ApiResponse<ICsvData[]>(csv, res);
   });
}

function nan(num: string): number {
   return isNaN(Number(num)) ? 0 : Number(num);
}

function parse(array: string[]): ICsvData {
   const [date, credit, debit, category, description, from_bank, to_bank, actual_debit, actual_credit] = array;   

   return {
      actual_credit: nan(actual_credit),
      actual_debit: nan(actual_debit),
      category,
      credit: nan(credit),
      date,
      debit: nan(debit),
      description,
      from_bank,
      to_bank
   }
}