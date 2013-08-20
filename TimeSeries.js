/*
 * TimeSeries.js
 *
 * Copyright 2013, Sunicy.Tao 
 * Released under the MIT Licence
 * http://opensource.org/licenses/MIT
 *
 * Github: http://github.com/sunicy/TimeSeries/
 * Version: 0.0
 */

function TimeSeries(options) {

  /******************************\
          Private Methods
  \******************************/
  var self = this;  // Stores this

  var list = [];    // Stores alist of tables

  var isUndefined = function(v) {
    return (typeof v === 'undefined');
  };

  var isFunction = function(v) {
    return typeof v === 'function';
  };

  var isArray = function(v) {
    return toString.call(v) === "[object Array]";
  };

  var isGenericArray = function(v) {
    /* Once v has 'splice' and 'length', it should be regarded as an array-like object */
    return isFunction(v.splice) && !isUndefined(v.length);
  };
  
  var isObject = function(v) {
    return (typeof v === 'object');
  };

  var extend = function(obj) { 
    for (var i = 0; i < arguments.length; i++)
      for (key in arguments[i])
        if (arguments[i].hasOwnProperty(key))
          // Never deep copy
          obj[key] = arguments[i][key];
    return obj;
  };

  var defValIfUndefined = function(x, defVal) {
    return (isUndefined(x)) ? defVal : x;
  };

  /*
   *  args should be a list of arguments
   */
  var safeCall = function(f, _this, args) {
    if (!isFunction(f))
      return undefined;
    return f.apply(_this, args);
  };

  /*
   * Walk through 'obj', 'fn' would be called if current key is its own
   * fn: callback function(key, index, obj), 
   *      foreach would stop once 'fn' returns false
   */
  var foreach = function(obj, fn) {
    var i = 0;
    for (key in obj)
      if (obj.hasOwnProperty(key))
        if (safeCall(fn, this, [key, i++, obj]) === false)
          return;
  };

  var settings = extend({
    data: [
      1234567890, {
        'count': 100,
        'field1': 'abc',
      },
    ],
  }, options);
}

/******************************\
        Public Methods
\******************************/

/* Walk through all time series in 'self',
  fn=function(index), 'each' stops if fn returns false */
TimeSeries.prototype.each = function(fn) {
  for (var i = 0; i < self.length; i++)
    if (safeCall(fn, self[i], [i]) === false)
      return;
};

TimeSeries.prototype.groupBy = function(field) {
};

TimeSeries.prototype.sum = function() {
};

TimeSeries.prototype.count = function() {
};

TimeSeries.prototype.clone = function(oldTimeSeries) {
};

/******************************\
       Entry for node.js 
\******************************/
TimeSeries();
