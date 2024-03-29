﻿namespace CityTravel.Tests.Web.Controllers
{
    using CityTravel.Domain.Abstract;
    using CityTravel.Domain.Services.Autocomplete;
    using CityTravel.Tests.Domain.DomainModel;
    using CityTravel.Tests.Domain.Services.Autocomplete;
    using CityTravel.Tests.Domain.UnitOfWork;
    using CityTravel.Web.UI.Controllers;

    using NUnit.Framework;

    /// <summary>
    /// The autocomplete controller tests.
    /// </summary>
    [TestFixture]
    public class AutocompleteControllerTests
    {
        #region Constants and Fields

        /// <summary>
        /// The autocomplete.
        /// </summary>
        private IAutocomplete autocomplete;

        /// <summary>
        /// The autocomplete controller.
        /// </summary>
        private AutocompleteController autocompleteController;

        /// <summary>
        /// The unit of work.
        /// </summary>
        private IUnitOfWork unitOfWork;

        #endregion

        #region Public Methods and Operators

        /// <summary>
        /// The set up.
        /// </summary>
        [SetUp]
        public void SetUp()
        {
            this.unitOfWork = new FakeUnitOfWork(new FakeDbContext());
            this.autocomplete = new FakeAutocomplete();
            this.autocompleteController = new AutocompleteController(this.autocomplete);
        }

        /// <summary>
        /// The can_ get_ predictions_ for_ end_ address.
        /// </summary>
        [Test]
        public void Can_Get_Predictions_For_End_Address()
        {
            // Arrange
            const string Value = "а";

            // Act
            var result = this.autocompleteController.GetPredictionsForEnd(Value);
            var jsonList = result.Data.ToString();

            // Assert
            Assert.IsTrue(jsonList.Contains("status"));
        }

        /// <summary>
        /// The can_ get_ predictions_ for_ start_ address.
        /// </summary>
        [Test]
        public void Can_Get_Predictions_For_Start_Address()
        {
            // Arrange
            const string Value = "у";

            // Act
            var result = this.autocompleteController.GetPredictionsForStart(Value);
            var jsonList = result.Data.ToString();

            // Assert
            Assert.IsTrue(jsonList.Contains("status"));
        }

        #endregion
    }
}