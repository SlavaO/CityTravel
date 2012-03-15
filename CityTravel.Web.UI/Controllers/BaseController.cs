using System.Globalization;
using System.Threading;
using System.Web.Mvc;
using CityTravel.Domain.Abstract;
using CityTravel.Web.UI.Helpers;

namespace CityTravel.Web.UI.Controllers
{
    /// <summary>
    /// The base controller.
    /// </summary>
    public class BaseController : Controller
    {
        #region Constructors and Destructors

        /// <summary>
        /// Initializes a new instance of the <see cref="BaseController"/> class.
        /// </summary>
        /// <param name="unitOfWork">The unit of work.</param>
        //public BaseController(IUnitOfWork unitOfWork)
        //{
        //    this.UnitOfWork = unitOfWork;
        //}

        #endregion

        #region Properties

        /// <summary>
        /// Gets UnitOfWork.
        /// </summary>
        //protected IUnitOfWork UnitOfWork { get; private set; }

        #endregion

        #region Methods

        /// <summary>
        /// The execute core.
        /// </summary>
        protected override void ExecuteCore()
        {
            string cultureName = null;

            var cultureCookie = this.Request.Cookies["_culture"];
            var userLanguages = this.Request.UserLanguages;
            if (userLanguages != null)
            {
                cultureName = cultureCookie != null ? cultureCookie.Value : userLanguages[0];
            }

            cultureName = CultureHelper.GetImplementedCulture(cultureName);

            Thread.CurrentThread.CurrentCulture = new CultureInfo(cultureName);
            Thread.CurrentThread.CurrentUICulture = Thread.CurrentThread.CurrentCulture;

            base.ExecuteCore();
        }

        #endregion
    }
}