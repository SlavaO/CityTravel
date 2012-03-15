using System;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using CityTravel.Web.UI.Models;

namespace CityTravel.Web.UI.Controllers
{
    /// <summary>
    /// The Server Validation class.
    /// </summary>
    public class ValidateServer : ValidationAttribute
    {
        /// <summary>
        /// The overrided Server Validation method.
        /// </summary>
        /// <param name="value">
        /// The value.
        /// </param>
        /// <param name="validationContext">
        /// The validation Context.
        /// </param>
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var jsonObj = (MakeRouteViewModel)value; // cast the object to type MakeRouteViewModel

            // Coordinates of the boundary of Dnepropetrovsk
            var polyCoords =
                new
                    {
                        SWLong = 48.38544219115483,
                        SWLat = 34.8953247070312,
                        NELong = 48.510236244324055,
                        NELat = 35.13153076171875
                    };

            Regex r = new Regex(@"^\d+$"); // any digits

            var startPointLat = Convert.ToDouble(jsonObj.StartPointLongitude);
            // Verify that the Point A and Point B are in the boundries of Dnepropetrovsk
            if ((Convert.ToDouble(jsonObj.StartPointLongitude) >= polyCoords.SWLong
                 && Convert.ToDouble(jsonObj.StartPointLongitude) <= polyCoords.NELong
                 && Convert.ToDouble(jsonObj.StartPointLatitude) <= polyCoords.NELat
                 && Convert.ToDouble(jsonObj.StartPointLatitude) >= polyCoords.SWLat)
                &&
                (Convert.ToDouble(jsonObj.EndPointLongitude) >= polyCoords.SWLong
                 && Convert.ToDouble(jsonObj.EndPointLongitude) <= polyCoords.NELong
                 && Convert.ToDouble(jsonObj.EndPointLatitude) <= polyCoords.NELat
                 && Convert.ToDouble(jsonObj.EndPointLatitude) >= polyCoords.SWLat)
                // verify that the entered addresses are not empty strings and defined
                && (jsonObj.AddressPointA != null || jsonObj.AddressPointA != "")
                && (jsonObj.AddressPointB != null || jsonObj.AddressPointB != "")
                //  verifying that not a digit was entered in address fields
                && (!r.IsMatch(jsonObj.AddressPointA) && !r.IsMatch(jsonObj.AddressPointB))) return ValidationResult.Success;
            else
            {
                // If the address A not right set the appropriate field to ""
                if (jsonObj.AddressPointA == null || jsonObj.AddressPointA == "" || r.IsMatch(jsonObj.AddressPointA)) jsonObj.AddressPointA = "";

                // If the address B not right set the appropriate field to ""
                if (jsonObj.AddressPointB == null || jsonObj.AddressPointB == "" || r.IsMatch(jsonObj.AddressPointB)) jsonObj.AddressPointB = "";

                return new ValidationResult(Resources.Resources.Validation);
            }

        }
    }
}
