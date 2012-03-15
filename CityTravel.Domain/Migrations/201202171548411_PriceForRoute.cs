namespace CityTravel.Domain.Migrations
{
    using System.Data.Entity.Migrations;
    
    public partial class PriceForRoute : DbMigration
    {
        public override void Up()
        {
            AddColumn("Route", "Price", c => c.Single(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("Route", "Price");
        }
    }
}
