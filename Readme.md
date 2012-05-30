# WhisperJS

  Provides access to all the routes and route middleware setup through express from other places in the application. Takes an object with three properties: method, path, body.  This can also be an array of objects to run multiple requests at once.  This is useful for bundling many ajax calls into one request or simulating requests through a socket connection.

  The module will intercept the res.send, res.render, and res.redirect call from the final callback of the route (generally, the controller) and send the data back through your defined callback.

## Installation

npm:

    $ npm install whisperjs

## Simple Usage

To get started simply run the init method and pass it the server instance which will be used to find routes for each request.
  
    require('whisperjs').init(server);

Then build your request object and pass it to the send method

    var Whisper = require('whisperjs');

    var request = { method: 'post', path: '/login', body: {username: "Jim", password: "password"} }

    Whisper.send(request, function(err, result) {
      callback(err, result);
    })

## Advanced Usage

You can also send an array of request objects and pass it to the send method

    var request = [
      { method: 'post', path: '/login', body: {username: "Jim", password: "password"} },
      { method: 'get', path: '/posts/new'} }
    ];

    Whisper.send(request, function(err, result) {
      callback(err, result)
    })

    /**
     * returns:
     * 
     * {0: {"result of login callback"}, 1: {"result of get new posts callback"}}
     */

The returned result will be an object containing all of results in the same order an index of the original array. To use custom indexes on the return object, simply pass a sequence property with the request and that property will be used as the index in the return object.

    var request = [
      { method: 'post', path: '/login', body: {username: "Jim", password: "password"}, sequence: "login" },
      { method: 'get', path: '/posts/new'}, "newposts" }
    ];
    
    Whisper.send(request, function(err, result) {
      callback(err, result)
    })

    /**
     * returns:
     * 
     * {"login": {"result of login callback"}, "newposts": {"result of get new posts callback"}}
     */


## License

    The MIT License

    Copyright (c) 2011 Jim Snodgrass <jim@skookum.com>

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    'Software'), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
