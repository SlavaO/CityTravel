﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using CityTravel.Domain.Entities;
using CityTravel.Domain.Settings;
using Microsoft.SqlServer.Types;
using Newtonsoft.Json.Linq;

namespace CityTravel.Domain.Helpres
{
    /// <summary>
    /// Helpers for work with google map api
    /// </summary>
    public static class GoogleMapHelper
    {
        /// <summary>
        /// Distance token
        /// </summary>
        public const string DistanceToken = "routes[0].legs[0].distance.value";

        /// <summary>
        /// Polyline points
        /// </summary>
        public const string PolylinePointsToken = "routes[0].overview_polyline.points";

        /// <summary>
        /// Time of direction
        /// </summary>
        public const string TimeDirectionToken = "routes[0].legs[0].duration.value";

        /// <summary>
        /// Dinstance matrix token
        /// </summary>
        public const string DistanceMatrixToken = "rows[0].elements[0].distance.value";

        /// <summary>
        /// Distance of meters in kilometer
        /// </summary>
        private const int Kilometer = 1000;

        /// <summary>
        /// Hour in minutes
        /// </summary>
        private const int Hour = 60;

        /// <summary>
        /// Walking speed
        /// </summary>
        private const int WalkingSpeed = 5;

        /// <summary>
        /// Gets the distance of direction.
        /// </summary>
        /// <param name="jsonObject">The json object.</param>
        /// <returns>
        /// Distance in meters
        /// </returns>
        public static double GetDistanceOfDirection(JObject jsonObject)
        {
            JToken token = jsonObject.SelectToken(DistanceToken);

            return token != null ? (double)token : 0;
        }

        /// <summary>
        /// Gets the time of direction.
        /// </summary>
        /// <param name="jsonObject">The json object.</param>
        /// <returns>Time of direction </returns>
        public static double GetTimeOfDirection(JObject jsonObject)
        {
            JToken token = jsonObject.SelectToken(TimeDirectionToken);

            return token != null ? (double)token : 0;
        }

        /// <summary>
        /// Decodes the polyline.
        /// </summary>
        /// <param name="polyline">The polyline.</param>
        /// <returns>Decoded polyline</returns>
        public static List<MapPoint> DecodePolyline(string polyline)
        {
            if (string.IsNullOrEmpty(polyline))
            {
                return null;
            }

            char[] polylinechars = polyline.ToCharArray();
            int index = 0;
            var points = new List<MapPoint>();
            int currentLat = 0;
            int currentLng = 0;

            while (index < polylinechars.Length)
            {
                int sum = 0, shifter = 0, next5Bits;

                do
                {
                    next5Bits = polylinechars[index++] - 63;
                    sum |= (next5Bits & 31) << shifter;
                    shifter += 5;
                }
                while (next5Bits >= 32 && index < polylinechars.Length);

                if (index >= polylinechars.Length)
                {
                    break;
                }

                currentLat += (sum & 1) == 1 ? ~(sum >> 1) : (sum >> 1);
                sum = 0;
                shifter = 0;
                do
                {
                    next5Bits = polylinechars[index++] - 63;
                    sum |= (next5Bits & 31) << shifter;
                    shifter += 5;
                }
                while (next5Bits >= 32 && index < polylinechars.Length);

                if (index >= polylinechars.Length && next5Bits >= 32)
                {
                    break;
                }

                currentLng += (sum & 1) == 1 ? ~(sum >> 1) : (sum >> 1);
                points.Add(
                    new MapPoint()
                    {
                        Longitude = Convert.ToDouble(currentLat) / 100000.0,
                        Latitude = Convert.ToDouble(currentLng) / 100000.0
                    });
            }

            return points;
        }

        /// <summary>
        /// Gets the google answer for autocomplete.
        /// </summary>
        /// <param name="address">The address.</param>
        /// <returns>String with json-formed result wich retrieved from Google API.</returns>
        public static string GetGoogleAnswerForAutocomplete(string address)
        {
            StringBuilder sb = new StringBuilder();
            var buf = new byte[18192];

            // prepare the web page we will be asking for
            var first = "Днепропетровск Днепропетровская область " + address;
            const string Key1 = "AIzaSyAESAHKfk6MOaE16uNuHYvxZp47wei6uMo";
            var request =
                (HttpWebRequest)
                WebRequest.Create(
                    "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=" + first
                    + "&types=geocode&language=ru&sensor=false&key=" + Key1);

            // execute the request
            var response = (HttpWebResponse)request.GetResponse();

            // we will read data via the response stream
            var resStream = response.GetResponseStream();

            var count = 0;

            do
            {
                // fill the buffer with data
                if (resStream != null)
                {
                    count = resStream.Read(buf, 0, buf.Length);
                }

                // make sure we read some data
                if (count == 0)
                {
                    continue;
                }

                // translate from bytes to ASCII text
                // string tempString = Encoding. .Unicode .GetString(buf, 0, count);
                var tempString = DeleteFromAddressUnwantedValues(Encoding.UTF8.GetString(buf, 0, count));

                // continue building the string
                if (!tempString.Contains("��"))
                {
                    // This code doesnt work!!
                    sb.Append(tempString);
                }
            }
            while (count > 0);

            if (resStream != null)
            {
                resStream.Dispose();
            }

            return DeleteFromAddressUnwantedValues(sb.ToString().Replace("\n", string.Empty));
        }

        /// <summary>
        /// Gets the steps of direction.
        /// </summary>
        /// <param name="jsonObject">The json object.</param>
        /// <returns>Steps of route.</returns>
        public static List<Step> GetStepsOfDirection(JObject jsonObject)
        {
            var steps = new List<Step>();
            int i = 0;
            do
            {
                string step = string.Format("routes[0].legs[0].steps[{0}].distance.value", i);
                if (jsonObject.SelectToken(step) == null)
                {
                    break;
                }

                string distanceToken = string.Format("routes[0].legs[0].steps[{0}].distance.value", i);
                double time = (double)jsonObject.SelectToken(distanceToken) / (((double)WalkingSpeed / Hour) * Kilometer);
                string instructionToken = string.Format("routes[0].legs[0].steps[{0}].html_instructions", i);
                string stepTime = string.Format(time.ToString("F1") + "{0}", "мин");

                steps.Add(
                    new Step
                    {
                        Instruction = (string)jsonObject.SelectToken(instructionToken.Replace("??", string.Empty)),
                        Time = stepTime,
                        Length = Route.GetRoundDistance((double)jsonObject.SelectToken(distanceToken))
                    });
                i++;
            }
            while (true);

            return steps;
        }

        /// <summary>
        /// Gets the direction.
        /// </summary>
        /// <param name="requestUrl">The request URL.</param>
        /// <returns>
        /// Json token of derections from google map api
        /// </returns>
        public static JObject GetResponceFromGoogleApi(string requestUrl)
        {
            string url = requestUrl;
            var request = (HttpWebRequest)WebRequest.Create(url);
            var response = (HttpWebResponse)request.GetResponse();
            var responceStream = response.GetResponseStream();
            var count = 0;
            var buffer = new byte[18192];
            var stringBuilder = new StringBuilder();

            do
            {
                if (responceStream != null)
                {
                    count = responceStream.Read(buffer, 0, buffer.Length);
                }

                if (count == 0)
                {
                    continue;
                }

                string currentData = Encoding.UTF8.GetString(buffer, 0, count);
                stringBuilder.Append(currentData);
            }
            while (count > 0);

            if (responceStream != null)
            {
                responceStream.Dispose();
            }

            var jsonObject = JObject.Parse(stringBuilder.ToString().Replace("\n", string.Empty));
            return jsonObject;
        }

        /// <summary>
        /// Gets the summary polyline.
        /// </summary>
        /// <param name="jsonObject">The json object.</param>
        /// <returns>
        /// Polilyne in latitude and longitude
        /// </returns>
        public static IEnumerable<MapPoint> GetSummaryPolyline(JObject jsonObject)
        {
            JToken token = jsonObject.SelectToken(PolylinePointsToken);
            IEnumerable<MapPoint> points = DecodePolyline((string)token);

            return points;
        }

        /// <summary>
        /// Gets the matrix of disnances.
        /// </summary>
        /// <param name="responce">The responce.</param>
        /// <returns>
        /// List of distances.
        /// </returns>
        public static List<double> GetMatrixOfDistanceForOneStop(JObject responce)
        {
            var distances = new List<double>();
            var counter = 0;

            while (true)
            {
                var distanceToken = string.Format("rows[0].elements[{0}].distance.value", counter);
                if (responce.SelectToken(distanceToken) == null)
                {
                    break;
                }

                distances.Add((double)responce.SelectToken(distanceToken));
                counter++;
            }

            return distances;
        }

        /// <summary>
        /// Gets the distance matrix.
        /// </summary>
        /// <param name="responce">The responce.</param>
        /// <param name="stops">The stops.</param>
        /// <returns>Distance of matrix.</returns>
        public static List<List<double>> GetMatrixOfDistanceForRoutes(JObject responce, List<List<Stop>> stops)
        {
            var distances = new List<List<double>>();
            var counter = 0;
            for (var i = 0; i < stops.Count; i++)
            {
                distances.Add(new List<double>());

                for (int j = 0; j < stops[i].Count; j++)
                {
                    string token = string.Format("rows[0].elements[{0}].distance.value", counter);
                    distances[i].Add((double)responce.SelectToken(token));
                    counter++;
                }
            }

            return distances;
        }

        /// <summary>
        /// Creates the URL for request.
        /// </summary>
        /// <param name="key">The key.</param>
        /// <param name="start">The start.</param>
        /// <param name="end">The end.</param>
        /// <returns>
        /// Url of google api direction.
        /// </returns>
        public static string CreateUrlForDirectionRequest(string key, SqlGeography start, SqlGeography end)
        {
            var parameters = string.Format(
                "{0}&destination={1}&mode=walking&language=ru&sensor=false&amp;key={2}", CreatePointForRequest(start), CreatePointForRequest(end), key);

            return "http://maps.googleapis.com/maps/api/directions/json?origin=" + parameters;
        }

        /// <summary>
        /// Creates the URL for disntance matrix request.
        /// </summary>
        /// <param name="key">The key.</param>
        /// <param name="startPoint">The start point.</param>
        /// <param name="stops">The stops.</param>
        /// <returns>
        /// Url for request.
        /// </returns>
        public static string CreateUrlForDisntanceMatrixRequest(string key, SqlGeography startPoint, List<Stop> stops)
        {
            string start = CreatePointForRequest(startPoint);
            List<string> end = stops.Select(stop => CreatePointForRequest(stop.StopGeography)).ToList();
            List<SqlGeography> endpoint = stops.Select(stop => stop.StopGeography).ToList();
            var stringBuilder = new StringBuilder();
            stringBuilder.Append(string.Format("{0}&destinations=", start));

            foreach (SqlGeography point in endpoint)
            {
                string points = string.Empty;
                points = string.Format(point.STEquals(endpoint.Last()) ? "{0}" : "{0}|", CreatePointForRequest(point));
                stringBuilder.Append(points);
            }

            stringBuilder.Append("&mode=walking&language=ru&sensor=false");

            return "http://maps.googleapis.com/maps/api/distancematrix/json?origins=" + stringBuilder;
        }

        /// <summary>
        /// Creates the URL for disntance matrix request for routes.
        /// </summary>
        /// <param name="key">The key.</param>
        /// <param name="startPoint">The start point.</param>
        /// <param name="possibleStartStops">The possible start stops.</param>
        /// <returns>
        /// Distance for naerest stops.
        /// </returns>
        public static string CreateUrlForDisntanceMatrixRequestForRoutes(
            string key, SqlGeography startPoint, List<List<Stop>> possibleStartStops)
        {
            string startMarker = CreatePointForRequest(startPoint);
            var possibleStartPoints = possibleStartStops.Select(route => route.Select(r => r.StopGeography)).ToList();
            var stringBuilder = new StringBuilder();
            stringBuilder.Append(string.Format("{0}&destinations=", startMarker));
            var a = possibleStartStops.Last().Last();

            foreach (var route in possibleStartPoints)
            {
                foreach (var stop in route.Select(s => s))
                {
                    var points =
                        string.Format(
                        stop.STEquals(possibleStartPoints.Last().Last()) ? "{0}" : "{0}|",
                            CreatePointForRequest(stop));
                    stringBuilder.Append(points);
                }
            }

            stringBuilder.Append("&mode=walking&language=ru&sensor=false");
            string url = string.Format(
                "http://maps.googleapis.com/maps/api/distancematrix/json?origins=" + "{0}", stringBuilder);

            return url;
        }

        /// <summary>
        /// Creates the point for request.
        /// </summary>
        /// <param name="point">The point.</param>
        /// <returns>String f</returns>
        private static string CreatePointForRequest(SqlGeography point)
        {
            return point.GetLatitude() + "," + point.GetLongitude();
        }

        /// <summary>
        /// The delete from address unwanted values.
        /// </summary>
        /// <param name="address">
        /// The address.
        /// </param>
        /// <returns>
        /// Fixed address
        /// </returns>
        private static string DeleteFromAddressUnwantedValues(string address)
        {
            string[] unwanredValues = 
            {
                "Днепропетровская область,", "Днепропетровск,", "Днепропетровск", " Украина",
                " Ukraine", " Україна", " Украйна"
            };

            return unwanredValues.Aggregate(address, (current, value) => current.Replace(value, string.Empty));
        }
    }
}
