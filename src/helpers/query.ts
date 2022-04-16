//@ts-check
import {client} from "../../index";

export async function Query(query: string) {
   return await client.query(query);
}