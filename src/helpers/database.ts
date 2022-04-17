import {Client} from "pg";

export default class DataBase {
   static #url = "postgres://soqrtphsehmwha:2905ebf04fb2abebdb81468cf8f7b466d6626a4b444e685653e1c17219b8a422@ec2-52-3-60-53.compute-1.amazonaws.com:5432/drn515r112ojs";
   static #db_URL: string = DataBase.#url;
   static DB: Client = new Client({
      connectionString: DataBase.#db_URL, ssl: {
         rejectUnauthorized: false
      }
   });

   static connect() {
      DataBase.DB.connect();
   }
}