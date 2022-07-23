import express, {Router} from 'express';
import * as Bank from "../services/bank.service";

const bankRouter: Router = express.Router();

bankRouter.get("/list", Bank.List);

export default bankRouter;