using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Linq.Expressions;
using CityTravel.Domain.Abstract;
using CityTravel.Domain.CacheProvider;
using CityTravel.Domain.DomainModel;
using CityTravel.Domain.Entities;
using CityTravel.Domain.Settings;

namespace CityTravel.Domain.Repository
{
    /// <summary>
    /// The generic repository.
    /// </summary>
    /// <typeparam name="T">
    /// type of objects in repository
    /// </typeparam>
    public class GenericRepository<T> : IProvider<T>
        where T : BaseEntity
    {
        #region Constants and Fields

        /// <summary>
        /// The context.
        /// </summary>
        private IDataBaseContext context;

        #endregion

        #region Constructors and Destructors

        /// <summary>
        /// Initializes a new instance of the <see cref="GenericRepository{T}"/> class.
        /// </summary>
        /// <param name="context">
        /// The context.
        /// </param>
        public GenericRepository(IDataBaseContext context)
        {
            this.context = context;
            this.Cache = new DefaultCacheProvider();
        }

        #endregion

        #region Public Properties

        /// <summary>
        ///   Gets the count.
        /// </summary>
        public int Count
        {
            get
            {
                return this.DbSet.Count();
            }
        }

        #endregion

        #region Properties

        /// <summary>
        /// Gets or sets Cache.
        /// </summary>
        protected ICacheProvider Cache { get; set; }

        /// <summary>
        ///   Gets the db set.
        /// </summary>
        private IDbSet<T> DbSet
        {
            get
            {
                return this.context.Set<T>();
            }
        }

        #endregion

        #region Public Methods and Operators

        /// <summary>
        /// Adds the specified t.
        /// </summary>
        /// <param name="entity">
        /// The entity. 
        /// </param>
        public void Add(T entity)
        {
            /*  var data = Cache.Get(typeof (T).ToString()) as List<T>;
            if (data != null)
            {
                //TO-DO:data.invvalidate(typeOf(T).toString());
                data.Add(entity);
                Cache.Set(typeof(T).ToString(), data, TimeSpan.FromMinutes(GeneralSettings.CacheTime));
                DbSet.Add(entity);
            }
            else
            {*/
            this.DbSet.Add(entity);

            // }
        }

        /// <summary>
        /// Alls this instance.
        /// </summary>
        /// <returns>
        /// all objects
        /// </returns>
        public IEnumerable<T> All()
        {
            var data = this.Cache.Get(typeof(T).ToString()) as List<T>;

            if (data == null)
            {
                data = this.DbSet.ToList();
                if (data.Any())
                {
                    this.Cache.Set(typeof(T).ToString(), data, TimeSpan.FromMinutes(GeneralSettings.CacheTime));
                }
            }
            return data;
        }

        /// <summary>
        /// Determines whether [contains] [the specified predicate].
        /// </summary>
        /// <param name="predicate">
        /// The predicate. 
        /// </param>
        /// <returns>
        /// <c>true</c> if [contains] [the specified predicate]; otherwise, <c>false</c> . 
        /// </returns>
        public bool Contains(Expression<Func<T, bool>> predicate)
        {
            return this.DbSet.Count(predicate) > 0;
        }

        /// <summary>
        /// Deletes the specified t.
        /// </summary>
        /// <param name="entity">
        /// The entity. 
        /// </param>
        public void Delete(T entity)
        {
            /* var data = Cache.Get(typeof (T).ToString()) as List<T>;
            if (data != null)
            {
                //TO-DO:data.invvalidate(typeOf(T).toString());
                data.Remove(entity);
                Cache.Set(typeof (T).ToString(), data, TimeSpan.FromMinutes(GeneralSettings.CacheTime));
                DbSet.Remove(entity);
            }
            else
            {*/
            this.DbSet.Remove(entity);

            // }
        }

        /// <summary>
        /// Deletes the specified predicate.
        /// </summary>
        /// <param name="predicate">
        /// The predicate. 
        /// </param>
        public void Delete(Expression<Func<T, bool>> predicate)
        {
            var objects = this.Filter(predicate).ToList();
            var count = objects.Count();

            /* var data = Cache.Get(typeof (T).ToString()) as List<T>;

            if (data != null)
            {
                for (int i = 0; i < count; i++)
                {
                    //TO-DO:data.invvalidate(typeOf(T).toString());
                    data.Remove(objects[i]);
                    DbSet.Remove(objects[i]);
                }
                Cache.Set(typeof(T).ToString(), data, TimeSpan.FromMinutes(GeneralSettings.CacheTime));
            }
            else
            {*/
            for (int i = 0; i < count; i++)
            {
                this.DbSet.Remove(objects[i]);
            }

            // }
        }

        /// <summary>
        /// Filters the specified predicate.
        /// </summary>
        /// <param name="predicate">
        /// The predicate. 
        /// </param>
        /// <returns>
        /// filters objects
        /// </returns>
        public IEnumerable<T> Filter(Expression<Func<T, bool>> predicate)
        {
            return this.DbSet.Where(predicate).AsEnumerable();
        }

        /// <summary>
        /// Finds the specified predicate.
        /// </summary>
        /// <param name="predicate">
        /// The predicate. 
        /// </param>
        /// <returns>
        /// find object by predicate
        /// </returns>
        public T Find(Expression<Func<T, bool>> predicate)
        {
            return this.DbSet.FirstOrDefault(predicate);
        }

        /// <summary>
        /// Gets the by id.
        /// </summary>
        /// <param name="id">
        /// The id. 
        /// </param>
        /// <returns>
        /// object found
        /// </returns>
        public T GetById(int id)
        {
            return this.Find(x => x.Id == id);
        }

        /// <summary>
        /// Updates the specified t.
        /// </summary>
        /// <param name="entity">
        /// The entity. 
        /// </param>
        public void Update(T entity)
        {
            var data = this.Cache.Get(typeof(T).ToString()) as List<T>;
            if (data != null)
            {
                // TO-DO:data.invvalidate(typeOf(T).toString());
                var index = data.FindIndex(type => type.Id == entity.Id);
                data[index] = entity;
                this.Cache.Set(typeof(T).ToString(), data, TimeSpan.FromMinutes(GeneralSettings.CacheTime));
                this.DbSet.Attach(entity);
            }
            else
            {
                this.DbSet.Attach(entity);
            }
        }

        public int Save()
        {
            return this.context.SaveChanges();
        }

        #endregion

        #region Methods

        /// <summary>
        /// Clears the cache.
        /// </summary>
        protected void ClearCache()
        {
            this.Cache.Invalidate(typeof(T).ToString());
        }

        #endregion
    }
}