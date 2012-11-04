/**
 * Whisper module
 *
 * allows requests to be sent directly to the controller using the preset express routes
 * and any middleware associated with them.
 *
 * Returns the response from the controller using the supplied callback
 *
 * @author Jim Snodgrass jim@skookum.com
 *
 */


var async = require("async"),
    _ = require('underscore'),
    middleware_exclusions = ["router","errorHandler"];


function Whisper() {}



Whisper.prototype = {
  
  /**
   * Initialize instance vars
   */
  init: function(server, options) {
    this.options = options || {};
    this.server = server;
    var middleware = this.buildStack(server.stack, middleware_exclusions);
    this.middleware_stack = middleware.stack;
    this.error_handlers = middleware.error_handlers;
  },


  /**
   * send request or array of requests
   */
  send: function(requests, callback) {
     
    var self = this;
     
    // an array of mulitple requests
    if (Array.isArray(requests)) {
      
      // define final results
      var results = [];
      
      async.forEach(requests,
        function (r, done) {
        
          // make actual request
          self.makeRequest(r, function(err, result) {
            
            // set result as error if there is one
            if (err) result = err;
            
            // if no sequence given
            if (typeof r.sequence == "undefined") results.push(result);
            
            // use sequence id
            else results[r.sequence] = result;

            done();
          });
        },
        function(err) {
          if (err) return callback(err);
          callback(null, results);
        }
      );
    }
    
    // only one request
    else {
      this.makeRequest(requests, callback);
    }
  },



  /**
   * make actual request
   *
   * @param Object data an object with all fields (method, path are required, body is optional)
   * @return either a request error or result of the request
   */
  makeRequest: function(data, callback) {

    var basepath = data.path.split("?")[0],
        self = this;
    
    this.findRoutes(data.method, basepath, function(routes) {
      // if route doesn't exist
      if (routes.length === 0) return callback("Couldn't find the route -> " + data.method + "::" + data.path);
      
        
      var url_pieces = basepath.split("/");
      var express_resource_pieces = [];
        
      // fill out req params, body, query
      var req = data.req || {};

      // if req user supplied add to request
      if (data.user) req.user = data.user;
       
      // req flash placeholder
      if (typeof req.flash === 'undefined') {
        req.flash = function(type, message){
          // console.log(type, message);
        };
      }

      req.url = data.path;
      req.session = {};
      req.headers = {host:basepath};
      req.body = {};
      req.params = {};
      
      if (typeof req.header === 'undefined') {
        req.header = function() {
          return '';
        };
      }
       
      // req.body
      if (typeof data.body == "string" && data.body !== "") {
        try {
          req.body = JSON.parse(data.body);
        }
        catch (e) {
          return callback("Error parsing JSON String: " + e);
        }
      }
      else {
        req.body = data.body;
      }
      
      // req.params
      var keynum = 0;

      // get params for each route
      _.each(routes, function(r) {
        var path_pieces = r.path.split("/");
        for (var p in path_pieces) {
          if (path_pieces[p].match(/^:.*/)) {
            req.params[r.keys[keynum].name] = url_pieces[p];
            keynum++;
          }
        }
      }),

      req.param = function(val, def) {
        return  req.params && req.params[val] || 
                req.query && req.query[val] || 
                req.body && req.body[val] || 
                def;
      };
      
      // res object
      var res = {
        setHeader: function() {},
        send:   function(props, code){
                  callback(null, props, code);
                },
        end:   function(props){
                  callback(null, props);
                },
        render: function(view, props) {
                  callback(null, 'render', view, props);
                },
        redirect: function(url) {
                  callback(null, 'redirect', url);
                }
      };

      // go through app middleware
      async.forEachSeries(self.middleware_stack, function(m, done) {
        m(req, res, done);
      }, function() {
        // console.log("done with app middleware");
      });

      // iterate through matching routes
      _.each(routes, function(route) {

        // run route callbacks
        async.forEachSeries(route.callbacks, function(cb, done) {
          cb(req, res, done);
        }, function(err) {
          
          // console.log("finishing route: " + route.path, err);
          if (err) {

            // iterate through error handlers if err in previous callbacks
            async.forEachSeries(self.error_handlers, function(eh, done) {
              eh(err, req, res, done);
            }, function(err) {});

          }
        });
      });
    });
  },


  /**
   * Find a matching routes
   *
   * @param String method the type of request (get, post, put, delete)
   * @param String path the path to match
   * @param Function callback
   * @return matching path if found, else null
   */
  findRoutes: function(method, path, callback) {

    var routes = [],
        allroutes = this.server.routes[method];

    for (var i = 0, il = allroutes.length; i < il ; i++) {
      if (path.match(allroutes[i].regexp)) routes.push(allroutes[i]);
    }

    callback(routes);
  },

  // get application middleware stack excluding router and error handlers
  buildStack: function(stack, exclusions) {
    var middleware = [],
        error_handlers = [],
        regex = /(function )(\b.*)(\()/,
        err_regex = /(function )(.*)(\(err,\s*req,\s*res)(.*\{)/;

    for (var i = 0; i < stack.length; i++) {
      var function_string = stack[i].handle + "",
          function_name = function_string.match(regex),
          is_error = err_regex.test(function_string);

      if (!function_name || exclusions.indexOf(function_name[2]) < 0) {
        if (is_error) error_handlers.push(stack[i].handle);
        else middleware.push(stack[i].handle);
      }
    }

    // console.log('num error handlers: ', error_handlers.length);

    return {
      stack:middleware,
      error_handlers: error_handlers
    };
  }


};


exports = module.exports = new Whisper();
