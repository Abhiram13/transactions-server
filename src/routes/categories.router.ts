import express, {Router} from 'express';
import * as Category from "../services/category.service";

const categoryRouter: Router = express.Router();

categoryRouter.get("/list", Category.List);

export default categoryRouter;