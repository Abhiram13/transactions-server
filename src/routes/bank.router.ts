import express, {Router} from 'express';
import {QueryResult} from 'pg';
import {Query} from "../helpers/query";
// import {ICategory} from '../types/categories.dto';

const bankRouter: Router = express.Router();

bankRouter.post("/add", async (req, res) => {
   try {
      const query = `INSERT into bank (name) VALUES ('State bank of india')`;
      const result: QueryResult<any> = await Query(query);

      if (result.rowCount) {
         res.status(200).send('Bank added successfully').end();
         return;
      }

      res.status(400).send('There is a problem adding Bank').end();
      return;
   } catch (e) {
      res.status(400).send(e).end();
   }
});

export default bankRouter;