using System;
using Npgsql;

namespace Database {
	public delegate ReturnType Reader<ReturnType>(NpgsqlDataReader reader);

	public class Connection {
		private static string host = "ec2-52-3-60-53.compute-1.amazonaws.com";
		private static string db = "drn515r112ojs";
		private static string user = "soqrtphsehmwha";
		private static string password = "2905ebf04fb2abebdb81468cf8f7b466d6626a4b444e685653e1c17219b8a422";
		private static string connectionString = $"Host={host};Username={user};Password={password};Database={db}";

		public static Type Sql<Type>(string query, Reader<Type> function) {
			using NpgsqlConnection connection = new NpgsqlConnection(connectionString);
			connection.Open();
			using NpgsqlCommand cmd = new NpgsqlCommand();
			cmd.Connection = connection;
			cmd.CommandText = query;
			return function(cmd.ExecuteReader());
		}
	}
}