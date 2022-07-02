import {Response} from 'express';

export default function apiResponse(callback: () => Promise<void>, res: Response) {
   try {
      callback();
   } catch (e: any) {
      res.status(500).send(e.message).end();
   }
}