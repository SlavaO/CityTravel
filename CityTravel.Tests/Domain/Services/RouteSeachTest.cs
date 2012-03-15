using System.Collections.Generic;
using System.Linq;

using CityTravel.Domain.Entities;
using CityTravel.Domain.Services.Segment;
using CityTravel.Tests.Domain.DomainModel;
using CityTravel.Tests.Domain.UnitOfWork;

using Microsoft.SqlServer.Types;

using NUnit.Framework;

namespace CityTravel.Tests.Domain.Services
{
    /// <summary>
    /// Route seach test
    /// </summary>
    [TestFixture]
    public class RouteSeachTest
    {
        /// <summary>
        /// Route seach class
        /// </summary>
        private RouteSeach route;
        
        /// <summary>
        /// Feka unit of work
        /// </summary>
        private FakeUnitOfWork fakeUnitOfWork;
       
        /// <summary>
        /// Start Marker
        /// </summary>
        private SqlGeography startPoint;

        /// <summary>
        /// End Marker
        /// </summary>
        private SqlGeography endPoint;

        /// <summary>
        /// Sets up.
        /// </summary>
        [SetUp]
        public void SetUp()
        {
            this.fakeUnitOfWork = new FakeUnitOfWork(new FakeDbContext());
            this.startPoint = new MapPoint(35.048072199999979, 48.437927).ToSqlGeography();
            this.endPoint = new MapPoint(35.045630999999958, 48.46442).ToSqlGeography();
            this.route = new RouteSeach(this.fakeUnitOfWork);
        }

        /// <summary>
        /// Determines whether this instance [can get appropriate routes].
        /// </summary>
        [Test]
        public void CanGetAppropriateRoutes()
        {
            var trasnportType = new List<Transport> { Transport.All };
            var appropriariateRoutes = this.route.GetAppropriateRoutes(this.startPoint, this.endPoint, trasnportType);
            var routes = this.fakeUnitOfWork.RouteRepository.All();

            Assert.True((bool)routes.First().RouteGeography.STEquals(appropriariateRoutes[1].RouteGeography));
        }

        /// <summary>
        /// Determines whether this instance [can get concrate type of transport].
        /// </summary>
        [Test]
        public void CanGetConcrateTypeOfTransport()
        {
            var transportType = new List<Transport> { Transport.Bus };
            var appropriariateRoutes = this.route.GetAppropriateRoutes(this.startPoint, this.endPoint, transportType);
            var routes = this.fakeUnitOfWork.RouteRepository.All();

            Assert.AreEqual(1, appropriariateRoutes.First().RouteType.Value);
        }
    }
}
