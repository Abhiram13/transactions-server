import express from 'express';
import Database from "./src/helpers/database";
import transactionRouter from './src/routes/transactions';
const app = express();
const port = process.env.PORT || 3001;

const client = Database.DB;
Database.connect();

app.get('/', (req, res) => {
   res.send('Hello World!');
});

app.use("/transactions", transactionRouter);

app.listen(port, () => {
   return console.log(`Express is listening at http://localhost:${port}`);
});

export {client};