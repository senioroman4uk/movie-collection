/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  'get /': 'MovieController.find',


  'post /subscribe': {
    controller: 'Page',
    action: 'subscribe'
  },

  'get /login': {
    controller: 'Session',
    action: 'new'
  },

  'get /logout': {
    controller: 'Session',
    action: 'destroy'
  },

  'get /signup': {
    controller: 'User',
    action: 'new'
  },

  'get /contacts/answered': {
    controller: 'Contact',
    action: 'findAnswered'
  },

  'get /dashboard': {
    controller: 'Dashboard',
    action: 'index'
  },

  'get /dashboard/genres': {
    controller: 'Dashboard',
    action: 'getGenres'
  },

  'get /dashboard/movies': {
    controller: 'Dashboard',
    action: 'getMovies'
  },

  'get /dashboard/pages': {
    controller: 'Dashboard',
    action: 'getPages'
  },

  'get /dashboard/roles': {
    controller: 'Dashboard',
    action: 'getRoles'
  },

  'get /dashboard/actors': {
    controller: 'Dashboard',
    action: 'getActors'
  },

  'get /dashboard/messages': {
    controller: 'Dashboard',
    action: 'getMessages'
  },

  'post /movies/update': {
    controller: 'Movie',
    action: 'update'
  },

  'post /pages/create': {
    controller: 'Page',
    action: 'create'
  },

  'post /pages/update': {
    controller: 'Page',
    action: 'update'
  },

  //#SECTION: routes for select2 control in dashboard
  'get /dashboard/actors/select': {
    controller: 'Dashboard',
    action: 'selectActors'
  },

  'get /dashboard/movies/select': {
    controller: 'Dashboard',
    action: 'selectMovies'
  },
  //#END SECTION

  //#SECTION: RSS
  'get /actors/rss': {
    controller: 'Actor',
    action: 'getRss'
  }
  //END SECTION

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

};
