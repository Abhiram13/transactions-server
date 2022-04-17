import express from 'express';
import bodyparser from "body-parser";
import Database from "./src/helpers/database";
import transactionRouter from './src/routes/transactions.router';
import categoryRouter from './src/routes/categories.router';
import bankRouter from './src/routes/bank.router';

const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

const client = Database.DB;
Database.connect();

app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());
app.use(cors());

app.get('/', (req, res) => {
   res.send('Hello World!');
});

app.use("/transactions", transactionRouter);
app.use("/category", categoryRouter);
app.use("/bank", bankRouter);

app.listen(port, () => {
   return console.log(`Express is listening at http://localhost:${port}`);
});

export {client};