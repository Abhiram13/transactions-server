import {client} from "../../index";
import express, {Router} from 'express';
import {ITransaction} from "../types/transactions.dto";
import {Query} from "../helpers/query";
import { AddTransactionCheck } from "../helpers/payload.checks";

const transactionRouter: Router = express.Router();

transactionRouter.get("/", async (request, response) => {
   const transactions: ITransaction[] = await (await Query("SELECT * FROM transactions")).rows;
   response.send(transactions).end();
});

transactionRouter.post("/add", AddTransactionCheck, async (request, response) => {
   console.log(request.body);
   // const transactions: ITransaction[] = await (await Query("SELECT * FROM transactions")).rows;
   // response.send(transactions).end();
});

export default transactionRouter;
