using CityTravel.Domain.Abstract;
using CityTravel.Domain.DomainModel;
using CityTravel.Domain.Entities;

namespace CityTravel.Domain.Repository
{
    /// <summary>
    /// Unit for work with repositories
    /// </summary>
    public class UnitOfWork : IUnitOfWork
    {
        #region Constants and Fields

        /// <summary>
        /// The context.
        /// </summary>
        private readonly IDataBaseContext context;

        /// <summary>
        /// The building repository.
        /// </summary>
        private IProvider<Building> buildingRepository;

        /// <summary>
        /// The feedback repository.
        /// </summary>
        private IProvider<Feedback> feedbackRepository;

        /// <summary>
        /// The language repository.
        /// </summary>
        private IProvider<Language> languageRepository;

        /// <summary>
        /// The place repository.
        /// </summary>
        private IProvider<Place> placeRepository;

        /// <summary>
        /// The route repository.
        /// </summary>
        private IProvider<Route> routeRepository;

        /// <summary>
        /// The stop repository.
        /// </summary>
        private IProvider<Stop> stopRepository;

        /// <summary>
        /// The transport type repository.
        /// </summary>
        private IProvider<TransportType> transportTypeRepository;

        #endregion

        #region Constructors and Destructors

        /// <summary>
        /// Initializes a new instance of the <see cref="UnitOfWork"/> class.
        /// </summary>
        /// <param name="context">
        /// The context. 
        /// </param>
        public UnitOfWork(IDataBaseContext context)
        {
            this.context = context;
            this.routeRepository = new RouteRepository(context);
            this.stopRepository = new StopRepository(context);
            this.feedbackRepository = new FeedbackRepository(context);
            this.transportTypeRepository = new TransportTypeRepository(context);
            this.languageRepository = new LanguageRepository(context);
            this.placeRepository = new PlaceRepository(context);
            this.buildingRepository = new BuildingRepository(context);
        }

        #endregion

        #region Public Properties

        /// <summary>
        ///   Gets the building repository.
        /// </summary>
        public IProvider<Building> BuildingRepository
        {
            get
            {
                return this.buildingRepository
                       ?? (this.buildingRepository = new GenericRepository<Building>(this.context));
            }
        }

        /// <summary>
        ///   Gets the feedback repository.
        /// </summary>
        public IProvider<Feedback> FeedbackRepository
        {
            get
            {
                return this.feedbackRepository
                       ?? (this.feedbackRepository = new GenericRepository<Feedback>(this.context));
            }
        }

        /// <summary>
        ///   Gets the languge repository.
        /// </summary>
        public IProvider<Language> LanguageRepository
        {
            get
            {
                return this.languageRepository
                       ?? (this.languageRepository = new GenericRepository<Language>(this.context));
            }
        }

        /// <summary>
        ///   Gets the place repository.
        /// </summary>
        public IProvider<Place> PlaceRepository
        {
            get
            {
                return this.placeRepository ?? (this.placeRepository = new GenericRepository<Place>(this.context));
            }
        }

        /// <summary>
        ///   Gets the route repository.
        /// </summary>
        public IProvider<Route> RouteRepository
        {
            get
            {
                return this.routeRepository ?? (this.routeRepository = new GenericRepository<Route>(this.context));
            }
        }

        /// <summary>
        ///   Gets the stop repository.
        /// </summary>
        public IProvider<Stop> StopRepository
        {
            get
            {
                return this.stopRepository ?? (this.stopRepository = new GenericRepository<Stop>(this.context));
            }
        }

        /// <summary>
        ///   Gets the transport type repository.
        /// </summary>
        public IProvider<TransportType> TransportTypeRepository
        {
            get
            {
                return this.transportTypeRepository
                       ?? (this.transportTypeRepository = new GenericRepository<TransportType>(this.context));
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