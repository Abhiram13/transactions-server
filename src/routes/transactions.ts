import {client} from "../../index";
import express, {Router} from 'express';

const transactionRouter: Router = express.Router();

transactionRouter.get("/", async (request, response) => {
   const x = await (await client.query("SELECT * FROM transactions")).rows;
   response.send(x).end();
});

export default transactionRouter;
