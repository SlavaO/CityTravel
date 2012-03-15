using CityTravel.Domain.Abstract;
using CityTravel.Domain.DomainModel;
using CityTravel.Domain.Entities;
using CityTravel.Tests.Domain.Repository;

namespace CityTravel.Tests.Domain.UnitOfWork
{
    /// <summary>
    /// The fake unit of work.
    /// </summary>
    public class FakeUnitOfWork : IUnitOfWork
    {
        #region Constants and Fields

        /// <summary>
        /// The context.
        /// </summary>
        private readonly IDataBaseContext context;

        #endregion

        #region Constructors and Destructors

        /// <summary>
        /// Initializes a new instance of the <see cref="FakeUnitOfWork"/> class.
        /// </summary>
        /// <param name="context">
        /// The context. 
        /// </param>
        public FakeUnitOfWork(IDataBaseContext context)
        {
            this.context = context;
        }

        #endregion

        #region Public Properties

        /// <summary>
        /// Gets BuildingRepository.
        /// </summary>
        public IProvider<Building> BuildingRepository
        {
            get
            {
                return FakeRepository<Building>.Mock(this.context.Buildings);
            }
        }

        /// <summary>
        ///   Gets the feedback repository.
        /// </summary>
        public IProvider<Feedback> FeedbackRepository
        {
            get
            {
                return FakeRepository<Feedback>.Mock(this.context.Feedbacks);
            }
        }

        /// <summary>
        /// Gets LanguageRepository.
        /// </summary>
        public IProvider<Language> LanguageRepository
        {
            get
            {
                return FakeRepository<Language>.Mock(this.context.Languages);
            }
        }

        /// <summary>
        /// Gets PlaceRepository.
        /// </summary>
        public IProvider<Place> PlaceRepository
        {
            get
            {
                return FakeRepository<Place>.Mock(this.context.Places);
            }
        }

        /// <summary>
        ///   Gets the route repository.
        /// </summary>
        public IProvider<Route> RouteRepository
        {
            get
            {
                return FakeRepository<Route>.Mock(this.context.Routes);
            }
        }

        /// <summary>
        ///   Gets the stop repository.
        /// </summary>
        public IProvider<Stop> StopRepository
        {
            get
            {
                return FakeRepository<Stop>.Mock(this.context.Stops);
            }
        }

        /// <summary>
        ///   Gets the transport type repository.
        /// </summary>
        public IProvider<TransportType> TransportTypeRepository
        {
            get
            {
                return FakeRepository<TransportType>.Mock(this.context.TransportTypes);
            }
        }

        #endregion

        #region Public Methods and Operators

        /// <summary>
        /// Saves this instance.
        /// </summary>
        /// <returns>
        /// The save.
        /// </returns>
        public int Save()
        {
            return this.context.SaveChanges();
        }

        #endregion
    }
}