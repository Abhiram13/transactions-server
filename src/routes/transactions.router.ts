import express, {Router} from 'express';
import {Query} from "../helpers/query";
import {AddTransactionCheck} from "../helpers/payload.checks";
import {ListofTransactions, addTransaction} from '../services/transactions.service';

const transactionRouter: Router = express.Router();

transactionRouter.get("/", ListofTransactions);
transactionRouter.post("/add", AddTransactionCheck, addTransaction);
transactionRouter.get("/searchById/:id", async (request, response) => {
   try {
      const transactionId: string = request.params.id;
      const query = `SELECT amount, type, date, description, color, due, id, 
         json_build_object('from_person', d.from_person, 'to_person', d.to_person, 'status', d.status) AS dues,
         json_build_object('id', b.b_id, 'name', b.name, 'logo', b.logo) AS bank,
         json_build_object('id', c.c_id, 'name', c.category) AS category
         FROM transactions t 
         LEFT JOIN dues d ON d.transaction_id = t.id
         LEFT JOIN categories c ON c.c_id = t.category_id
         LEFT JOIN bank b ON b.b_id = t.from_bank_id
         WHERE t.id = ${transactionId}`;
      const result = await (await Query(query)).rows;
      response.status(200).send(result).end();
   } catch (e) {
      response.status(400).send(e).end();
   }
});

export default transactionRouter;
