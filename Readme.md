# WhisperJS

  provides 

## Installation

npm:

    $ npm install express-resource

## Usage

 To get started simply `require('whisperjs)`, and this module will monkey-patch Express, enabling resourceful routing by providing the `app.resource()` method. A "resource" is simply an object, which defines one of more of the supported "actions" listed below:

    exports.index = function(req, res){
      res.send('forum index');
    };

## Running Tests

The test is built in vowsjs (http://vowsjs.org/). First make sure you have vow installed:

    $ npm install vows -g

Then run the tests:

    $ vows test.js

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
