//@ts-check
import {ITransactionPayload} from "../types/transactions.dto";
import {Query} from "../helpers/query";
import {QueryResult} from "pg";

export class TransactionService {
   constructor(private payload: ITransactionPayload) {}
   
   private async addDues(transaction_id: number): Promise<boolean> {
      const {due_details} = this.payload;
      const insertDue = `INSERT INTO dues (from_person, to_person, status, transaction_id) VALUES 
         ('${due_details.from_person}', '${due_details.to_person}', 'active', ${transaction_id}) RETURNING d_id`;
      const result: QueryResult<any> = await Query(insertDue);
      if (result.rowCount && result.rows.length > 0) {
         return true;
      }

      return false;
   }

   async addTransaction(): Promise<boolean> {      
      const d: ITransactionPayload = this.payload; 
      const insertQuery = `INSERT INTO transactions (amount, type, date, description, due, from_bank_id, category_id, to_bank_id) VALUES
         (${d.amount}, '${d.type}', '${d.date}', '${d.description}', ${d.due}, ${d.from_bank_id}, ${d.category_id}, ${d.to_bank_id}) RETURNING id`;
      const result: QueryResult<any> = await Query(insertQuery);

      if (result.rowCount && result.rows.length > 0) {
         if (d.due) {
            return await this.addDues(result.rows[0].id);
         }

         return true;
      }

      return false;
   }
}