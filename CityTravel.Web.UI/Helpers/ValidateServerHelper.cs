using System;
using System.Text.RegularExpressions;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.SqlTypes;
using Microsoft.SqlServer.Types;
using Microsoft.SqlServer.SpatialToolbox;
using System.ComponentModel.DataAnnotations;

using CityTravel.Web.UI.Models;
using CityTravel.Domain.Settings;

namespace CityTravel.Web.UI.Controllers
{
    /// <summary>
    /// The Server Validation class.
    /// </summary>
    public class ValidateServerHelper : ValidationAttribute
   {
        /// <summary>
        /// The overrided Server Validation method.
        /// </summary>
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var jsonObj = (MakeRouteViewModel)value; // cast the object to type MakeRouteViewModel

            /// Coordinates of the boundary of Dnepropetrovsk
            var polyCoords = new
            {
                SWLong = GeneralSettings.GetSouthWestLongitude,
                SWLat = GeneralSettings.GetSouthWestLatitude,
                NELong = GeneralSettings.GetNorthEastLongitude,
                NELat = GeneralSettings.GetNorthEastLatitude
            };

            Regex anydigit = new Regex(@"^\d+$"); // any digits

			var startPointLon = Convert.ToDouble(jsonObj.StartPointLongitude);
			var startPointLat = Convert.ToDouble(jsonObj.StartPointLatitude);
			var endPointLon = Convert.ToDouble(jsonObj.EndPointLongitude);
			var endPointLat = Convert.ToDouble(jsonObj.EndPointLatitude);

           /// Verify that the Point A and Point B are in the boundries of Dnepropetrovsk
           if ( startPointLon >= polyCoords.SWLong
           && startPointLon <= polyCoords.NELong
           && startPointLat <= polyCoords.NELat
           && startPointLat >= polyCoords.SWLat
           && endPointLon >= polyCoords.SWLong
           && endPointLon <= polyCoords.NELong
           && endPointLat <= polyCoords.NELat
           && endPointLat >= polyCoords.SWLat
           // verify that the entered addresses are not empty strings and defined
           && (jsonObj.AddressPointA != null || jsonObj.AddressPointA != string.Empty)
           && (jsonObj.AddressPointB != null || jsonObj.AddressPointB != string.Empty)
           // verifying that not a digit was entered in address fields
           && (!anydigit.IsMatch(jsonObj.AddressPointA) && !anydigit.IsMatch(jsonObj.AddressPointB)))
               return ValidationResult.Success;
           else
           {
               /// If the address A not right set the appropriate field to ""
               if (jsonObj.AddressPointA == null || jsonObj.AddressPointA == string.Empty || anydigit.IsMatch(jsonObj.AddressPointA))
                   jsonObj.AddressPointA = string.Empty;

                /// If the address B not right set the appropriate field to ""
                if (jsonObj.AddressPointB == null || jsonObj.AddressPointB == string.Empty || anydigit.IsMatch(jsonObj.AddressPointB))
                    jsonObj.AddressPointB = string.Empty;

                return new ValidationResult(Resources.Resources.Validation);
                }
         }
    }
}
