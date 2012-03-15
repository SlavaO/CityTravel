namespace CityTravel.Domain.Migrations
{
    using System.Data.Entity.Migrations;

    /// <summary>
    /// The autocomplete.
    /// </summary>
    public partial class Autocomplete : DbMigration
    {
        #region Public Methods and Operators

        /// <summary>
        /// The down.
        /// </summary>
        public override void Down()
        {
            this.DropIndex("Place", new[] { "LangId" });
            this.DropIndex("Building", new[] { "PlaceId" });
            this.DropForeignKey("Place", "LangId", "Place");
            this.DropForeignKey("Building", "PlaceId", "Place");
            this.AlterColumn("Place", "Count", c => c.Int(nullable: false));
            this.AlterColumn("Place", "PlaceInRussainId", c => c.Int(nullable: false));
            this.AlterColumn("Place", "LangId", c => c.Int(nullable: false));
            this.AlterColumn("Place", "Type", c => c.String(nullable: false));
            this.AlterColumn("Place", "Name", c => c.String(nullable: false));
            this.AlterColumn("Language", "Name", c => c.String(nullable: false));
            this.AlterColumn("Building", "PlaceId", c => c.Int(nullable: false));
            this.AlterColumn("Building", "BuildingIndexNumber", c => c.String(nullable: false));
        }

        /// <summary>
        /// The up.
        /// </summary>
        public override void Up()
        {
            this.AlterColumn("Building", "BuildingIndexNumber", c => c.String());
            this.AlterColumn("Building", "PlaceId", c => c.Int());
            this.AlterColumn("Language", "Name", c => c.String());
            this.AlterColumn("Place", "Name", c => c.String());
            this.AlterColumn("Place", "Type", c => c.String());
            this.AlterColumn("Place", "LangId", c => c.Int());
            this.AlterColumn("Place", "PlaceInRussainId", c => c.Int());
            this.AlterColumn("Place", "Count", c => c.Int());
            this.AddForeignKey("Building", "PlaceId", "Place", "Id");
            this.AddForeignKey("Place", "LangId", "Place", "Id");
            this.CreateIndex("Building", "PlaceId");
            this.CreateIndex("Place", "LangId");
        }

        #endregion
    }
}