using System.Data.Entity.Migrations;

using CityTravel.Domain.DomainModel;

namespace CityTravel.Domain.Migrations
{
    /// <summary>
    /// The configuration.
    /// </summary>
    internal sealed class Configuration : DbMigrationsConfiguration<DataBaseContext>
    {
        #region Constructors and Destructors

        /// <summary>
        /// Initializes a new instance of the <see cref="Configuration"/> class.
        /// </summary>
        public Configuration()
        {
            this.AutomaticMigrationsEnabled = true;
        }

        #endregion
    }
}