//@ts-check
import {ITransactionPayload, ITransaction, IDueDetails} from "../types/transactions.dto";
import {Query} from "../helpers/query";
import {QueryResult} from "pg";
import {Request, Response} from 'express';
import {ApiErrorHandler, ApiResponse} from "../helpers/response";
import {Worker, isMainThread, workerData, parentPort, threadId, MessageChannel, MessagePort} from 'worker_threads';
// import {fileURLToPath} from 'url';
// import {dirname} from 'path';
import * as fs from 'fs';
import path from "path";

type Bank = {id: number, name: string;};
type Category = {id: number, category: string;};

function thread(data: string, message: string, dirname: string, key: string) {
   return new Promise(resolve => {
      const worker = new Worker(dirname, {workerData: data});
      const channel = new MessageChannel();
      worker.postMessage({[key]: channel.port1}, [channel.port1]);
      channel.port2.on("message", (value) => {
         resolve(`${message}: ${value}`);
      });
   });
}

const months = new Map();
months.set("January", "01")
months.set("February", "02")
months.set("March", "03")
months.set("April", "04")
months.set("May", "05")
months.set("June", "06")
months.set("July", "07")
months.set("August", "08")
months.set("September", "09")
months.set("October", "10")
months.set("November", "11")
months.set("December", "12")

// export async function ListofTransactions(req: Request, res: Response) { 
//    console.log(path.join(__dirname, '..', 'javascript', 'worker.js'))
//    ApiErrorHandler(res, async () => {
//       const debitSum = `CASE WHEN t.type ILIKE 'debit' THEN amount END`;
//       const creditSum = `CASE WHEN t.type ILIKE 'credit' THEN amount END`;
//       const subQuery = `
//          SELECT json_build_object('id', tr.id, 'amount', tr.amount, 'description', tr.description, 'type', tr.type, 'category', c.category, 'from_bank', fb.name, 'to_bank', tb.name) 
//          FROM transactions tr 
//          LEFT JOIN categories c ON c.c_id = tr.category_id
//          LEFT JOIN bank fb ON fb.b_id = tr.from_bank_id         
//          LEFT JOIN bank tb ON tb.b_id = tr.to_bank_id
//          WHERE tr.date = t.date
//       `;
//       const mainQuery = `
//          SELECT to_char(date, 'YYYY-MM-DD') as date, COALESCE(SUM(${debitSum}), 0)::int as debit, COALESCE(SUM(${creditSum}), 0)::int as credit,
//          array(${subQuery}) as transactions FROM transactions t GROUP BY t.date
//       `;
//       const transactions: ITransaction[] = await (await Query(mainQuery)).rows;
//       ApiResponse<ITransaction[]>(transactions, res, 200);
//    });
// }

export async function ListofTransactions(req: Request, res: Response) { 
   ApiErrorHandler(res, async () => {
      // const dirname = path.join(__dirname, '..', 'javascript', 'worker.js');
      // const x = thread('one', 'something', dirname, 'dasdassdasd');
      // const y = thread('two', 'another', dirname, 'seconded');
      // console.log(await x);
      // console.log(await y);
      const debitSum = `CASE WHEN t.type ILIKE 'debit' THEN amount END`;
      const creditSum = `CASE WHEN t.type ILIKE 'credit' THEN amount END`;
      const subQuery = `
         SELECT json_build_object('id', tr.id, 'amount', tr.amount, 'description', tr.description, 'type', tr.type, 'category', c.category, 'from_bank', fb.name, 'to_bank', tb.name) 
         FROM transactions tr 
         LEFT JOIN categories c ON c.c_id = tr.category_id
         LEFT JOIN bank fb ON fb.b_id = tr.from_bank_id         
         LEFT JOIN bank tb ON tb.b_id = tr.to_bank_id
         WHERE tr.date = t.date
      `;
      const mainQuery = `
         SELECT to_char(date, 'YYYY-MM-DD') as date, COALESCE(SUM(${debitSum}), 0)::int as debit, COALESCE(SUM(${creditSum}), 0)::int as credit,
         array(${subQuery}) as transactions FROM transactions t GROUP BY t.date
      `;

      console.log(mainQuery);
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

export class CsvData {
   static #banks: Bank[] = []; 
   static #categories: Category[] = [];

   static async #fetchBanks() {
      const banks: Bank[] = await (await Query(`SELECT b_id as id, name FROM bank`)).rows;
      CsvData.#banks = banks;
   }

   static async #fetchCategories() {
      const categories: Category[] = await (await Query(`SELECT c_id as id, category FROM categories`)).rows;
      CsvData.#categories = categories;
   }

   static #csvToJson(path: string): ITransaction[] {
      var data: string = fs.readFileSync(path, "utf-8");
      var array: string[] = data.split("\r\n");
      var csv: ITransaction[] = [];
      for (let i = 1; i < array.length; i++) {
         const x: string[] = array[i].split(",");
         csv.push(CsvData.#parse(x));
      }
      return csv;
   }

   static #parseData(date: string): string {
      const [day, month, year] = date.split(" ");
      return `${year}-${months.get(month)}-${day.padStart(2, "0")}`;
   }

   static #Nan(num: string): number {
      return isNaN(Number(num)) ? 0 : Number(num);
   }

   static #fetchBank(bankName: string, banks: Bank[]): number {
      const bank: Bank[] = CsvData.#banks.filter(b => b.name === bankName);
      return bank.length ? bank[0].id : 0;
   }

   static #defineType(debit: string, credit: string, ad: string, ac: string): string {
      if (CsvData.#Nan(debit) && CsvData.#Nan(ad)) return 'debit';
      if (CsvData.#Nan(credit) && CsvData.#Nan(ac)) return 'credit';
      if (CsvData.#Nan(debit) && !CsvData.#Nan(ad)) return 'partial debit';
      if (CsvData.#Nan(credit) && !CsvData.#Nan(ac)) return 'partial credit';
      return "";
   }

   static #setCategory(category: string): number {
      const cat: Category[] = CsvData.#categories.filter(c => c.category === category);
      return cat.length ? cat[0].id : 0;
   }

   static #parse(array: string[]): ITransaction {
      const [date, credit, debit, category, description, from_bank, to_bank, actual_debit, actual_credit] = array;
      const obj: ITransaction = {
         amount: CsvData.#Nan(credit) || CsvData.#Nan(debit),
         category_id: CsvData.#setCategory(category),
         date: CsvData.#parseData(date),
         description: description,
         due: false,
         from_bank_id: CsvData.#fetchBank(from_bank, CsvData.#banks),
         to_bank_id: CsvData.#fetchBank(to_bank, CsvData.#banks),
         type: CsvData.#defineType(debit, credit, actual_debit, actual_credit),
      };

      return obj;
   }

   static async formData(req: Request, res: Response): Promise<void> {
      return ApiErrorHandler(res, async () => {
         await CsvData.#fetchBanks();
         await CsvData.#fetchCategories();
         const path: string = req["file"]?.path as string;
         const data: ITransaction[] = CsvData.#csvToJson(path);
         fs.unlink(path, err => console.log("error: ", err));

         await CsvData.bulkUpload(res, data);
      });
   }

   static async bulkUpload(res: Response, data: ITransaction[]): Promise<void> {
      return ApiErrorHandler(res, async () => {       
         const loops: string[] = data.map(d => `(${d.amount}, '${d.type}', '${d.date}', '${d.description}', ${d.due}, ${d.from_bank_id}, ${d.category_id}, ${d.to_bank_id})`);
         const query: string = `INSERT INTO transactions (amount, type, date, description, due, from_bank_id, category_id, to_bank_id) VALUES ${loops.join(", ")}`;

         const result = await (await Query(query)).rowCount
         const message: string = result > 0 ? "Bulk upload successful" : "There is some problem";
         const status: number = result > 0 ? 200 : 500;
         
         ApiResponse<string>(message, res, status);
      });
   }
}