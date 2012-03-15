using CityTravel.Domain.DomainModel;
using CityTravel.Tests.Domain.DomainModel;

namespace CityTravel.Tests.Domain.UnitOfWork
{
    using NUnit.Framework;

    /// <summary>
    /// The unit of work tests.
    /// </summary>
    [TestFixture]
    public class UnitOfWorkTests
    {
        #region Constants and Fields

        /// <summary>
        /// The data base context.
        /// </summary>
        private IDataBaseContext dataBaseContext;

        #endregion

        #region Public Methods and Operators

        /// <summary>
        /// Can_s the create_ unit of work_ instance.
        /// </summary>
        [Test]
        public void Can_Create_UnitOfWork_Instance()
        {
            // Arrange
            var unitOfWork = new CityTravel.Domain.Repository.UnitOfWork(this.dataBaseContext);

            // Assert
            Assert.AreNotEqual(null, unitOfWork.RouteRepository);
            Assert.AreNotEqual(null, unitOfWork.StopRepository);
            Assert.AreNotEqual(null, unitOfWork.FeedbackRepository);
            Assert.AreNotEqual(null, unitOfWork.TransportTypeRepository);
        }

        /// <summary>
        /// Can_s the save_ changes.
        /// </summary>
        [Test]
        public void Can_Save_Changes()
        {
            // Arrange
            var unitOfWork = new CityTravel.Domain.Repository.UnitOfWork(this.dataBaseContext);

            // Act
            var result = unitOfWork.Save();

            // Assert
            Assert.AreEqual(0, result);
        }

        /// <summary>
        /// Sets up.
        /// </summary>
        [SetUp]
        public void SetUp()
        {
            this.dataBaseContext = new FakeDbContext();
        }

        #endregion
    }
}