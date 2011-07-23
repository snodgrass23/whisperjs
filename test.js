/**
 * tests for whisper module
 *
 *
 * @author Jim Snodgrass jim@skookum.com
 *
 */

var vows = require('vows'),
    assert = require('assert')
    
var testReturn = "test return"    

var server = {    
  routes: {
    routes : {
      get: [
        { callback: function(req, res){res.send(testReturn)},
          path: '/route/check',
          method: 'get',
          regexp: /^\/route\/check\/?$/i,
          middleware: [ function(req, res, next){next()}, function(req, res, next){next()} ] }
      ]
    }  
  }  
}

// initialize whisper module
require('./index.js').init(server)

// define whisper object
var Whisper = require('./index.js')

// setup tests
vows.describe('whisper module test').addBatch({
  'make single request through makeRequest method': {
    topic: function() {
      var request = {method: 'get', path: '/route/check', body: null}
      Whisper.makeRequest(request, this.callback)
    },
    'should not be any errors': function(err, result) {
      assert.isNull(err)
    },
    'return should match setup server route': function(err, result) {
      assert.equal(result, testReturn);
    }
  },
  'send single request with wrong path': {
    topic: function() {
      var request = {method: 'get', path: '/wrong/path', body: null}
      Whisper.makeRequest(request, this.callback)
    },
    'should be an error': function(err, result) {
      assert.isNotNull(err)
    }
  }
}).addBatch({
  'send bundle request with one item NOT in array': {
    topic: function() {
      var request = {method: 'get', path: '/route/check', body: null}
      Whisper.send(request, this.callback)
    },
    'should not be any errors': function(err, result) {
      assert.isNull(err)
    },
    'return should match setup server route': function(err, result) {
      assert.equal(result, testReturn);
    }
  },
  'send bundle request with one item in array': {
    topic: function() {
      var request = [{method: 'get', path: '/route/check', body: null, sequence:0}]
      Whisper.send(request, this.callback)
    },
    'result should be object with sequence property': function(err, result) {
      assert.equal(result[0], testReturn)
    }
  },
  'send bundle request with two items in array': {
    topic: function() {
      var request = [{method: 'get', path: '/route/check', body: null, sequence:0},
                     {method: 'get', path: '/wrong/path', body: null, sequence:1}]
      Whisper.send(request, this.callback)
    },
    'check first item in result object': function(err, result) {
      assert.equal(result[0], testReturn)
    },
    'check second item in result object': function(err, result) {
      assert.notEqual(result[1], testReturn)
    }
  },
  'send bundle request with one item in array with no sequence property': {
    topic: function() {
      var request = [{method: 'get', path: '/route/check', body: null}]
      Whisper.send(request, this.callback)
    },
    'result should be object with sequence property': function(err, result) {
      assert.equal(result[0], testReturn)
    }
  },
  'send bundle request with two items in array with no sequence property': {
    topic: function() {
      var request = [{method: 'get', path: '/route/check', body: null},
                     {method: 'get', path: '/wrong/path', body: null}]
      Whisper.send(request, this.callback)
    },
    'check first item in result object': function(err, result) {
      assert.equal(result[0], testReturn)
    },
    'check second item in result object': function(err, result) {
      assert.notEqual(result[1], testReturn)
    }
  }
}).export(module);