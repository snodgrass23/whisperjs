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


var async = require("async");


function Whisper() {}


/**
 * Initialize new instance
 *
 */
Whisper.prototype.init = function(server, options) {
  this.options = options || {};
  this.allroutes = server.routes.routes;
}


/**
 *
 */ 
Whisper.prototype.send = function(requests, callback) {
   
  var self = this;
   
  // an array of mulitple requests
  if (Array.isArray(requests)) {
    
    // define final results
    var results = [];
    
    async.forEach(requests, processRequest, function(err) {
      if (err) {
        callback(err)
      }
      else {
         // send back results
        callback(null, results);
      }
    })
    
    
    // recursive function to loop through results
    function processRequest(r, done) {
      
      // make actual request
      self.makeRequest(r, function(err, result) {
        
        // set result as error if there is one
        if (err) result = err;
        
        // if no sequence given
        if (typeof r.sequence == "undefined") {
          // add to result object
          results.push(result);
        }
        
        // use sequence id
        else {
          // add to result object
          results[r.sequence] = result;
        }
 
        // call done
        done();
      })
    }
  }
  
  // only one request
  else {
    this.makeRequest(requests, callback)
  }
}



/**
 * make actual request
 *
 * @param Object data an object with all fields (method, path are required, body is optional)
 * @return either a request error or result of the request
 */
Whisper.prototype.makeRequest = function(data, callback) {
  
  var basepath = data.path.split("?")[0]; 
  
  this.findRoute(data.method, basepath, function(route) {
    // if route doesn't exist
    if (route === null) {
      
      // send back error
      callback("Couldn't find the route -> " + data.method + "::" + data.path);
    }
    
    // route was found
    else {
      
      var url_pieces = basepath.split("/");
      var path_pieces = route.path.split("/");
      
      // path arrays match
      if (url_pieces[1] == path_pieces[1]) {
        
        // fill out req params, body, query
        var req = {};
         
        // req.query
        req.query = {};
        data.path.replace(
            new RegExp("([^?=&]+)(=([^&]*))?", "g"),
            function($0, $1, $2, $3) { req.query[$1] = $3; }
        );
         
        // req.body
        if (typeof data.body == "string" && data.body != "") {
          req.body = JSON.parse(data.body);
        }
        else {
          req.body = data.body;  
        }
        
        // req.params
        req.params = {};
        var keynum = 0;
        for (var p in path_pieces) {
          if (path_pieces[p].match(/^:.*/)) {
            req.params[route.keys[keynum].name] = url_pieces[p];
            keynum++;
          }
        }
        
        // res object
        var res = {
          send:   function(props){
                    callback(null, props);
                  },
          render: function() {
                    callback(null, {})
                  } 
        }
        
        // middleware iterator counter
        var currentMiddleware = 0;
        
        // start middleware iterations
        nextReq();
        
        // recursive function to move through middleware until final callback
        function nextReq() {
          
          // all middleware has been processed, proceed to final callback
          if (currentMiddleware === route.middleware.length) {
            
            // call controller with alternate res.send function
            route.callback(req, res)
          }
          
          // run current middleware function
          else {
          
            // pass request through next route middlewar
            route.middleware[currentMiddleware](req, res, function(){
                currentMiddleware++;
                nextReq();
              })
          }
        }
      }
      
      // error matching route and path
      else {
        callback("Route and Path splits don't match");
      }
    }
  })
}


/**
 * Find a matching route
 *
 * @param String method the type of request (get, post, put, delete)
 * @param String path the path to match
 * @param Function callback
 * @return matching path if found, else null
 */
Whisper.prototype.findRoute = function(method, path, callback) {
  var route = null;
  
  var routes = this.allroutes[method.toLowerCase()];
  
  for (var r in routes) {
    if (routes.hasOwnProperty(r)) {
      if (path.match(routes[r].regexp)) {
        route = routes[r];
        break;
      }
    }
  }
  
  if (route == null) {
    //console.log("couldn't find -> " + method + "::" + path)
    //console.log(routes);
  }

  callback(route);
}


exports = module.exports = new Whisper()
