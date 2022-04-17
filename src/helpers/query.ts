//@ts-check
import {client} from "../../index";

export async function Query(query: string) {
   return await client.query(query);
}

export class PayloadObject {
   static keys(object: Object): string {
      return Object.keys(object).join(", ");
   }

   static values(object: Object): string {
      return Object.values(object).join(", ");
   }
}