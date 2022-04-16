import express, {Router} from 'express';
import {ITransaction, ITransactionPayload} from "../types/transactions.dto";
import {Query, PayloadObject} from "../helpers/query";
import { AddTransactionCheck } from "../helpers/payload.checks";

const transactionRouter: Router = express.Router();

transactionRouter.get("/", async (request, response) => {
   const transactions: ITransaction[] = await (await Query("SELECT * FROM transactions")).rows;
   response.send(transactions).end();
});

transactionRouter.post("/add", AddTransactionCheck, async (request, response) => {
   try {
      const {keys} = PayloadObject;
      const d: ITransactionPayload = request.body;
      const insertQuery = `INSERT INTO transactions (${keys(d)}) VALUES 
         (${d.amount}, '${d.type}', '${d.date}', '${d.description}', ${d.due}, ${d.from_bank_id}, ${d.category_id}, ${d.to_bank_id}) RETURNING id`;
      const rows: Array<{id: number}> = await (await Query(insertQuery)).rows;
      response.send(rows).end();
   } catch (e) {
      console.log(e);
   }
});

export default transactionRouter;
