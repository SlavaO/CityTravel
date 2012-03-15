namespace CityTravel.Domain.Migrations
{
    using System.Data.Entity.Migrations;

    /// <summary>
    /// The autocompte.
    /// </summary>
    public partial class Autocompte : DbMigration
    {
        #region Public Methods and Operators

        /// <summary>
        /// The down.
        /// </summary>
        public override void Down()
        {
            this.DropTable("Place");
            this.DropTable("Language");
            this.DropTable("Building");
        }

        /// <summary>
        /// The up.
        /// </summary>
        public override void Up()
        {
            this.CreateTable(
                "Building", 
                c =>
                new
                    {
                        Id = c.Int(nullable: false, identity: true), 
                        Number = c.Int(nullable: false), 
                        BuildingIndexNumber = c.String(nullable: false), 
                        PlaceId = c.Int(nullable: false), 
                        BuildingBin = c.Binary(), 
                    }).PrimaryKey(t => t.Id);

            this.CreateTable(
                "Language", c => new { Id = c.Int(nullable: false, identity: true), Name = c.String(nullable: false), })
                .PrimaryKey(t => t.Id);

            this.CreateTable(
                "Place", 
                c =>
                new
                    {
                        Id = c.Int(nullable: false, identity: true), 
                        Name = c.String(nullable: false), 
                        Type = c.String(nullable: false), 
                        LangId = c.Int(nullable: false), 
                        PlaceInRussainId = c.Int(nullable: false), 
                        PlaceBin = c.Binary(), 
                    }).PrimaryKey(t => t.Id);
        }

        #endregion
    }
}