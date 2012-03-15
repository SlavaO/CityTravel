using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;

using System.Data.SqlTypes;
using Microsoft.SqlServer.Types;
using System.Text.RegularExpressions;
using NUnit.Framework;

using CityTravel.Web.UI.Models;
using CityTravel.Web.UI.Controllers;
using System.ComponentModel.DataAnnotations;

namespace CityTravel.Tests.Domain.Entities
{
    /// <summary>
    /// The Server Validation Tests.
    /// </summary>
	[TestFixture]
	public class ServerValidationTests : ValidationAttribute
	{
		/// <summary>
		/// Can Validate Server Data.
		/// </summary>
		[Test]
		public void CanValidateServerData()
		{
			// Pointer to MakeRouteViewModel
			MakeRouteViewModel makeRoute = new MakeRouteViewModel();

			makeRoute.AddressPointA = "пр.Кирова 59";
			makeRoute.AddressPointB = "пр.Пушкина 55";
			makeRoute.EndPointLatitude = "35,0394344329834";
			makeRoute.EndPointLongitude = "48,46062862564409";
			makeRoute.StartPointLatitude = "35,03368377685547";
			makeRoute.StartPointLongitude = "48,45146411408362";

			ValidateServer validateServer = new ValidateServer();
			Assert.IsTrue(validateServer.IsValid( makeRoute ));
		}
	}
}


