namespace CityTravel.Domain.Migrations
{
    using System.Data.Entity.Migrations;

    /// <summary>
    /// The autocomplete 1.
    /// </summary>
    public partial class Autocomplete1 : DbMigration
    {
        #region Public Methods and Operators

        /// <summary>
        /// The down.
        /// </summary>
        public override void Down()
        {
            this.AlterColumn("Building", "Number", c => c.Int(nullable: false));
        }

        /// <summary>
        /// The up.
        /// </summary>
        public override void Up()
        {
            this.AlterColumn("Building", "Number", c => c.String());
        }

        #endregion
    }
}