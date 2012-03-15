using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.SqlTypes;
using Microsoft.SqlServer.Types;
using Microsoft.SqlServer.SpatialToolbox;
using System.Text.RegularExpressions;
using System.ComponentModel.DataAnnotations;


namespace CityTravel.Web.UI.Models
{
	public class ValidateServer : ValidationAttribute
	{
		protected override ValidationResult IsValid( object value, ValidationContext validationContext )
		{
			var validCoords = (MakeRouteViewModel)value;

			// Coordinates of the boundary of Dnepropetrovsk
			var polyCoords = new { 
				SWLong = 48.38544219115483, SWLat = 34.8953247070312,
				NELong = 48.510236244324055, NELat = 35.13153076171875
			    };

				Regex r = new Regex( @"^\d+$"); // any digits

				// Verify the that the Point A and Point B are in the boundries of Dnepropetrovsk
				if( (Convert.ToDouble(validCoords.StartPointLongitude) >= polyCoords.SWLong
				&& Convert.ToDouble(validCoords.StartPointLongitude) <= polyCoords.NELong
				&& Convert.ToDouble(validCoords.StartPointLatitude) <= polyCoords.NELat
				&& Convert.ToDouble(validCoords.StartPointLatitude) >= polyCoords.SWLat
				) && (Convert.ToDouble(validCoords.EndPointLongitude) >= polyCoords.SWLong
				&& Convert.ToDouble(validCoords.EndPointLongitude) <= polyCoords.NELong
				&& Convert.ToDouble(validCoords.EndPointLatitude) <= polyCoords.NELat
				&& Convert.ToDouble(validCoords.EndPointLatitude) >= polyCoords.SWLat
				)
				// verify that the entered addresses are not empty strings and defined
				 && (validCoords.AddressPointA != null || validCoords.AddressPointA != "")
				&& (validCoords.AddressPointB != null || validCoords.AddressPointB != "")

				//  verifying that not a digit was entered in address fields
				&& (!r.IsMatch(validCoords.AddressPointA) && !r.IsMatch(validCoords.AddressPointB)) 
				)
					return ValidationResult.Success;
				else
				{
					// If the address A not right set the appropriate field to ""
					if (validCoords.AddressPointA == null || validCoords.AddressPointA == "" || r.IsMatch(validCoords.AddressPointA))
						validCoords.AddressPointA = "";

					// If the address B not right set the appropriate field to ""
					if (validCoords.AddressPointB == null || validCoords.AddressPointB == "" || r.IsMatch(validCoords.AddressPointB))
						validCoords.AddressPointB = "";

					return new ValidationResult(Resources.Resources.Validation);
				}
			}
			
		public override bool IsValid( object value )
		{
			return base.IsValid( value );
		}
	}
}
