using Microsoft.AspNetCore.Mvc;

namespace Controllers {
	[Route("")]
	public class Controler : Controller {
		[HttpGet]
		[Route("")]
		public string FetchDocumentCount() {
			return "Hello Transactions";
		}
	}
}