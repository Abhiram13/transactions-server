using System;
using Npgsql;

namespace Models {
   // public class Transaction {
   //    public int id { get; set; }
	// 	public int amount { get; set; }
	// 	public string type { get; set; }
	// 	public string description { get; set; }
	// 	public string color { get; set; }
	// 	public bool due { get; set; }
	// 	public int due_id { get; set; }
	// 	public int from_bank_id { get; set; }
	// 	public int to_bank_id { get; set; }
	// 	public int category_id { get; set; }
	// 	public DateTime date { get; set; }
   // }

	public class Transaction {
		// private NpgsqlDataReader reader;
		// public Transactions() { }
		public Transaction(NpgsqlDataReader _reader) {
			this.amount = (int)_reader[0];
			this.type = (string)_reader[1];
         this.date = (DateTime)_reader[2];
         this.description = (string)_reader[3];
         this.color = (string)_reader[4];
         this.due = (bool)_reader[5];
         this.due_id = (int)_reader[6];
         this.from_bank_id = (int)_reader[7];
         this.category_id = (int)_reader[8];
         this.id = (int)_reader[9];
         // this.to_bank_id = _reader[10] == null ? 0 : (int)_reader[10];
		}
		public int amount { get; private set; }
		public string type { get; private set; }
		public DateTime date { get; private set; }
		public string description { get; private set; }
		public string color { get; private set; }
		public bool due { get; private set; }
		public int due_id { get; private set; }
		public int from_bank_id { get; private set; }
		public int category_id { get; private set; }
		public int id { get; private set; }
		public int? to_bank_id { get; private set; }
	}
}