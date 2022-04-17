import express, {Router} from 'express';
import {ITransaction} from "../types/transactions.dto";
import {Query} from "../helpers/query";
import {AddTransactionCheck} from "../helpers/payload.checks";
import { TransactionService } from '../services/transactions.service';

const transactionRouter: Router = express.Router();

transactionRouter.get("/", async (request, response) => {
   const transactions: ITransaction[] = await (await Query("SELECT * FROM transactions")).rows;
   response.send(transactions).end();
});

transactionRouter.post("/add", AddTransactionCheck, async (request, response) => {
   try {
      const b: boolean = await new TransactionService(request.body).addTransaction();
      response.status(200).send(b).end();
   } catch (e) {
      response.status(400).send(e).end();
   }
});

export default transactionRouter;
