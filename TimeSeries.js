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

function TimeSeries(obj, options) {

  /******************************\
          Private Methods
  \******************************/
  var self = this;  // Stores this

  var T_TIME_SERIES_SET = 'TimeSeriesSet',
      T_TIME_SERIES     = 'TimeSeries',
      T_OTHER           = false;

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

  var getTimeSeriesType = function(v) {
    return ('__type__' in v) ? v.__type__ : false;
  };

  var setTimeSeriesType = function(v, type) {
    return v.__type__ = type;
  };

  var extend = function(obj) { 
    for (var i = 0; i < arguments.length; i++)
      for (key in arguments[i])
        if (arguments[i].hasOwnProperty(key))
          // Never deep copy
          obj[key] = arguments[i][key];
    return obj;
  };

  /* Copy plainObject/Array recursively CAUTION: no cycle!  */
  var plainDeepCopy = function(obj) {
    if (!isObject(obj))
      return obj;
    var t = {};
    if (isArray(obj))
      t = [];
    foreach(obj, function(key, index, obj) {
      t[key] = plainDeepCopy(obj[key]);
    });
    return t;
  };

  var defValIfUndefined = function(x, defVal) {
    return (isUndefined(x)) ? defVal : x;
  };

  var settings = extend({
    dataType: 'time-dictionary',
    inPlace: false,       // do all operations in place?
  }, defValIfUndefined(options, {}));

  /*
   *  args should be a list of arguments
   */
  var safeCall = function(f, _this, args) {
    if (!isFunction(f))
      return undefined;
    return f.apply(_this, args);
  };

  /* returns an Object's own keys */
  var keys = function(obj) {
    if (Object.keys)
      return Object.keys();
    // For IE
    var keyList = [];
    for (key in obj)
      if (obj.hasOwnProperty(key))
        keyList.push(key);
    return keyList;
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

  var createSeries = function(append, rawData) {
    var series = {
        fields: [],
        data: [],
      };
    if (!isUndefined(rawData)) // Do the deepcopy
      series = plainDeepCopy(rawData);
    setTimeSeriesType(series, T_TIME_SERIES);
    if (defValIfUndefined(append, true))
      self[self.length++] = series;
    return series;
  };

  var init = function() {
    setTimeSeriesType(TimeSeries.prototype, T_TIME_SERIES_SET);
    self.length = 0;

    switch (getTimeSeriesType(obj)) {
      case T_TIME_SERIES_SET:
        // TODO: clone from 'obj'
        for (var i = 0; i < obj.length; i++)
          createSeries(true, obj[i]);
        break;
      default: {
        // regard 'obj' as raw data
        /* Format of data to feed in
          (FIXME:Now we only support data in the same form as that inside): 
              [
                [TIMESTAMP, {
                    attr1: 10,
                    attr2: '',
                    ...
                  }
                ],
                ...
              ]

          Format of data inside TimeSeries:
            {
              fields: ['field1', 'f2', ...],
              data:   [[TS, val1, ...], ...]
            }
        */
        // Hand to T_TIME_SERIES for creating
      }
      case T_TIME_SERIES:
        // construct the object from one time series 'obj'
        createSeries(true, obj);
        break;
    };
  };
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
