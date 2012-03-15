using System.Collections.Generic;
using System.Web.Mvc;

using CityTravel.Domain.Abstract;
using CityTravel.Domain.Entities;
using CityTravel.Web.UI.Models;

namespace CityTravel.Web.UI.Controllers
{
    using System.Linq;
    using CityTravel.Domain.Repository;

    /// <summary>
    /// The feedback controller.
    /// </summary>
    public class FeedbackController : BaseController
    {
        #region Fields
        private IProvider<Feedback> feedbackRepository;
        #endregion
        #region Constructors and Destructors

        /// <summary>
        /// Initializes a new instance of the <see cref="FeedbackController"/> class.
        /// </summary>
        /// <param name="unitOfWork">
        /// The unit of work. 
        /// </param>
        public FeedbackController(IUnitOfWork unitOfWork)
        {
            this.feedbackRepository = unitOfWork.FeedbackRepository;
        }

        #endregion

        #region Public Methods and Operators

        /// <summary>
        /// Feedbacks this instance.
        /// </summary>
        /// <returns>
        /// feedback viewresult
        /// </returns>
        public ViewResult Feedback()
        {
            var fb =feedbackRepository.All();
            var feedbackList = fb.ToList();
            return this.View("Feedback", feedbackList);
        }

        /// <summary>
        /// Feedbacks the form.
        /// </summary>
        /// <returns>
        /// feedback form
        /// </returns>
        public PartialViewResult FeedbackForm()
        {
            var fvm = new FeedbackViewModel();
            var types = new List<SelectListItem>
                {
                    new SelectListItem { Text = "Мнение", Value = "0" }, 
                    new SelectListItem { Text = "Предложение", Value = "1" }, 
                    new SelectListItem { Text = "Ошибка", Value = "2" }, 
                    new SelectListItem { Text = "Партнерство", Value = "3" }
                };
            fvm.Type = types;

            // fvm.SelectedValue = 0.ToString();
            return this.PartialView("FeedbackForm", fvm);
        }

        /// <summary>
        /// Feedbacks the form.
        /// </summary>
        /// <param name="fvm">
        /// The FVM. 
        /// </param>
        /// <returns>
        /// content result
        /// </returns>
        [HttpPost]
        public ContentResult FeedbackForm(FeedbackViewModel fvm)
        {
            var feedback = new Feedback
            {
                Email = fvm.Email,
                Name = fvm.Name ?? "Anonymous",
                Text = fvm.Text,
                Type = int.Parse(fvm.SelectedValue)
            };
            feedbackRepository.Add(feedback);
            feedbackRepository.Save();
            switch (feedback.Type)
            {
                case 0:
                    return
                        this.Content(
                            "<div class=\"greetings\" oncreate style=\"text-align:center; padding:20px;\">Спасибо, ваше мнение очень важно для нас. <a class='close' data-dismiss='modal'>×</a></div>",
                            "text/html");
                case 1:
                    return
                        this.Content(
                            "<div class=\"greetings\" oncreate style=\"text-align:center; padding:20px;\">Спасибо, ваше предложение будет расмотрено. <a class='close' data-dismiss='modal'>×</a></div>",
                            "text/html");
                case 2:
                    return
                        this.Content(
                            "<div class=\"greetings\" oncreate style=\"text-align:center; padding:20px;\">Спасибо, ошибка будет вскоре исправлена.<a class='close' data-dismiss='modal'>×</a></div>",
                            "text/html");
                case 3:
                    return
                        this.Content(
                            "<div class=\"greetings\" oncreate style=\"text-align:center; padding:20px;\">Спасибо за проявленый интерес к нашему сайту. Мы вскоре свяжемся с вами. <a class='close' data-dismiss='modal'>×</a></div>",
                            "text/html");
                default:
                    return
                        this.Content(
                            "<div class=\"greetings\" oncreate style=\"text-align:center; padding:20px;\" >Спасибо за ваш отзыв, он для нас очень важен. <a class='close' data-dismiss='modal'>×</a></div> ",
                            "text/html");
            }
        }

        #endregion
    }
}