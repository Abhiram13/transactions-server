export interface ITransaction {
   amount: number;
   type: string;
   date: Date;
   description: string;
   color: string;
   due: boolean;
   due_id: number;
   from_bank_id: number;
   category_id: number;
   id?: number;
   to_bank_id: number;
}