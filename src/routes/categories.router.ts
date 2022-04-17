import express, {Router} from 'express';
import {QueryResult} from 'pg';
import {Query} from "../helpers/query";
// import {ICategory} from '../types/categories.dto';

const categoryRouter: Router = express.Router();

categoryRouter.post("/add", async (req, res) => {
   try {
      const query = `INSERT into categories (category) VALUES ('${req.body.category}')`;
      const result: QueryResult<any> = await Query(query);

      if (result.rowCount) {
         res.status(200).send('Category added successfully').end();
         return;
      }

      res.status(400).send('There is a problem adding Category').end();
      return;
   } catch (e) {
      res.status(400).send(e).end();
   }
});

export default categoryRouter;