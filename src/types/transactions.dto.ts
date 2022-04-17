//@ts-check
export interface ITransaction {
   amount: number;
   type: string;
   date: Date;
   description: string;
   color: string;
   due: boolean;
   from_bank_id: number;
   category_id: number;
   id?: number;
   to_bank_id: number;
}

export interface ITransactionPayload extends ITransaction {
   due_details: IDueDetails;
}

export interface IDueDetails {
   from_person: string;
   to_person: string;
}