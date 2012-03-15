using System.Configuration;

namespace CityTravel.Domain.Settings
{
    /// <summary>
    /// Settigs for City Travel project
    /// </summary>
    public class GeneralSettings
    {
        #region Constants and Fields

        /// <summary>
        ///   Default cache value
        /// </summary>
        private const int DefaultCache = 5;

        /// <summary>
        /// Default radius seach for stops
        /// </summary>
        private const int DefaultStopRadiusSeach = 500;
       
        /// <summary>
        /// Default route radius seach
        /// </summary>
        private const int DefaultRouteRadiusSeach = 1500;

        /// <summary>
        /// Default time constraint
        /// </summary>
        private const int DefaultTimeConstraint = 2;

        /// <summary>
        /// Default walking speed
        /// </summary>
        private const int DefaultWalkingSpeed = 5;

        /// <summary>
        /// Max find index deflection
        /// </summary>
        private const int DefaultFindIndexDeflection = 30;

        /// <summary>
        /// Index deflection
        /// </summary>
        private const int DefaultIndexDeflection = 7;

        /// <summary>
        /// Max relations buffer
        /// </summary>
        private const int DefaultMaxRelationsBuffer = 1;

        /// <summary>
        ///   Google api key
        /// </summary>
        private const string DefaultGoogleApiKey = "AIzaSyAESAHKfk6MOaE16uNuHYvxZp47wei6uMo";

        #endregion

        #region Public Properties

        /// <summary>
        ///   Gets the cache time.
        /// </summary>
        public static int CacheTime
        {
            get
            {
                return ConfigurationManager.AppSettings["CacheTime"] != null
                           ? int.Parse(ConfigurationManager.AppSettings["CacheTime"])
                           : DefaultCache;
            }
        }

        /// <summary>
        ///   Gets the google API key.
        /// </summary>
        public static string GoogleApiKey
        {
            get
            {
                return ConfigurationManager.AppSettings["GoogleApiKey"] ?? DefaultGoogleApiKey;
            }
        }

        /// <summary>
        /// Gets the route radius seach.
        /// </summary>
        public static int RouteRadiusSeach
        {
            get
            {
                return ConfigurationManager.AppSettings["RouteRadiusSeach"] != null
                           ? int.Parse(ConfigurationManager.AppSettings["RouteRadiusSeach"])
                           : DefaultRouteRadiusSeach;
            }
        }

        /// <summary>
        /// Gets the max time constraint.
        /// </summary>
        public static int MaxTimeConstraint 
        {
            get
            {
                return ConfigurationManager.AppSettings["MaxTimeConstraint"] != null
                           ? int.Parse(ConfigurationManager.AppSettings["MaxTimeConstraint"])
                           : DefaultTimeConstraint;
            }
        }

        /// <summary>
        /// Gets WalkingSpeed.
        /// </summary>
        public static int WalkingSpeed
        {
            get
            {
                return ConfigurationManager.AppSettings["WalkingSpeed"] != null
                           ? int.Parse(ConfigurationManager.AppSettings["WalkingSpeed"])
                           : DefaultWalkingSpeed;
            }
        }

        /// <summary>
        /// Gets the max stop radius seach.
        /// </summary>
        public static int MaxStopRadiusSeach
        {
            get
            {
                return ConfigurationManager.AppSettings["MaxStopRadiusSeach"] != null
                           ? int.Parse(ConfigurationManager.AppSettings["MaxStopRadiusSeach"])
                           : DefaultStopRadiusSeach;
            }
        }

        /// <summary>
        /// Gets MaxFindIndexDeflection.
        /// </summary>
        public static int MaxFindIndexDeflection
        {
            get
            {
                return ConfigurationManager.AppSettings["MaxFindIndexDeflection"] != null
                           ? int.Parse(ConfigurationManager.AppSettings["MaxFindIndexDeflection"])
                           : DefaultFindIndexDeflection;
            }
        }

        /// <summary>
        /// Gets the max index deflection.
        /// </summary>
        public static int MaxIndexDeflection
        {
            get
            {
                return ConfigurationManager.AppSettings["MaxIndexDeflection"] != null
                           ? int.Parse(ConfigurationManager.AppSettings["MaxIndexDeflection"])
                           : DefaultIndexDeflection;
            }
        }

        /// <summary>
        /// Gets the mar buffer for refresh relations.
        /// </summary>
        public static int MaxRelationsBuffer
        {
           get
           {
               return ConfigurationManager.AppSettings["MaxRelationsBuffer"] != null
                           ? int.Parse(ConfigurationManager.AppSettings["MaxRelationsBuffer"])
                           : DefaultMaxRelationsBuffer;
           }
        }

        #endregion
    }
}