using System.Linq;

using CityTravel.Domain.Abstract;
using CityTravel.Tests.Domain.DomainModel;
using CityTravel.Tests.Domain.UnitOfWork;

using NUnit.Framework;

namespace CityTravel.Tests.Domain.Services.Autocomplete
{
    using CityTravel.Domain.Services.Autocomplete;

    /// <summary>
    /// Autocomplete tests
    /// </summary>
    [TestFixture]
    public class AutocompleteTests
    {
        /// <summary>
        /// The unit of work.
        /// </summary>
        private IUnitOfWork unitOfWork;

        /// <summary>
        /// The autocomplete
        /// </summary>
        private IAutocomplete autocomplete;

        /// <summary>
        /// The set up.
        /// </summary>
        [SetUp]
        public void SetUp()
        {
            this.unitOfWork = new FakeUnitOfWork(new FakeDbContext());
            this.autocomplete = new Autocomplete(this.unitOfWork);
        }

        /// <summary>
        /// Test can create Autocomplete instance
        /// </summary>
        [Test]
        public void Can_Create_Autocomplete_Instance()
        {
            // Arrange
            var auto = new Autocomplete(this.unitOfWork);

            // Assert
            Assert.AreNotEqual(null, auto);
        }

        /// <summary>
        /// Test can add suggestions to database
        /// </summary>
        [Test]
        public void Can_Add_Suggestions_To_Database()
        {
            // Arrange
            var placesCount = this.unitOfWork.PlaceRepository.Count;
            var suggestions = new[] { "Кирова", "Карла Маркса", "Короленко" }.ToList();

            // Act
            this.autocomplete.AddSuggestionsToDatabase(suggestions);

            // Assert
            Assert.AreEqual(placesCount + 3, this.unitOfWork.PlaceRepository.Count);

            // Arrange
            var buildingsCount = this.unitOfWork.BuildingRepository.Count;
            var buildings = new[] { "Кирова 54", "Карла Маркса 12", "Короленко 12" }.ToList();

            // Act
            this.autocomplete.AddSuggestionsToDatabase(buildings);

            // Assert
            Assert.AreEqual(buildingsCount + 3, this.unitOfWork.BuildingRepository.Count);
        }

        /// <summary>
        /// Test can get address from database
        /// </summary>
        [Test]
        public void Can_Get_Address_From_Database()
        {
            // Arrange
            const string ExistAddress = "klari";

            // Act
            var result = this.autocomplete.GetAdressFromDatabase(ExistAddress) as AutocompleteViewModel;

            // Assert
            Assert.AreNotEqual(null, result);
            Assert.AreEqual(result.Predictions.Count, 1);

            // Arrange
            const string ExistBuilding = "artema 60b";

            // Act
            var resultBuilding = this.autocomplete.GetAdressFromDatabase(ExistBuilding) as AutocompleteViewModel;

            // Assert
            Assert.AreNotEqual(null, resultBuilding);
            Assert.AreEqual(resultBuilding.Predictions.Count, 1);
        }
    }
}
