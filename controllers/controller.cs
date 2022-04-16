using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using Models;
using Npgsql;
using Database;
using System;

namespace Controllers {
	[Route("")]
	public class Controler : Controller {
		[HttpGet]
		[Route("")]
		public string FetchDocumentCount() {
			return "Hello Transactions";
		}

		// public static Transaction UpdateReaderDataToEmployee(NpgsqlDataReader reader) {
		// 	return new Transaction() {
		// 		amount = (int) reader[0],
		// 	};
		// }

      [HttpGet]
      [Route("/list")]
      public List<Transaction> List() {
			string query = $"SELECT * FROM transactions";
			return Connection.Sql(query, func);

			List<Transaction> func(NpgsqlDataReader reader) {
				List<Transaction> transactionList = new List<Transaction>();

				while (reader.Read()) {
					transactionList.Add(new Transaction(reader));
					// transactionList.Add(UpdateReaderDataToEmployee(reader));
				}

				return transactionList;
			}
      }
	}
}