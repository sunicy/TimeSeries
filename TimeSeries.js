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

(function (){
  TS = function(obj, options) {
    return new TimeSeries(obj, options);
  };

  TimeSeries = function(obj, options) {
  //return new function (obj, options) {

    /******************************\
            Private Methods
    \******************************/
    var self = this;  // Stores this

    var T_TIME_SERIES_SET = 'TimeSeriesSet',
        T_TIME_SERIES     = 'TimeSeries',
        T_OTHER           = false,
        
        F_COUNT           = 'count',
        F_TIMESTAMP       = 'timestamp';

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
      return (isObject(v) && '__type__' in v) ? v.__type__ : false;
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

    var updateTimeSeriesSet = function(timeSeriesSet, newSeriesList) {
      timeSeriesSet.length = 0;
      for (var i = 0, l = newSeriesList.length; i < l; i++)
        timeSeriesSet[timeSeriesSet.length++] = newSeriesList[i];
    };

    var createSeries = function(append, rawData, noData) {
      var series = {
          fields: [],
          data: [],
        };
      if (!isUndefined(rawData)) {// Do the deepcopy
        series.fields = plainDeepCopy(rawData.fields);
        if (noData !== false)
          series.data = plainDeepCopy(rawData.data);
      }
      setTimeSeriesType(series, T_TIME_SERIES);
      if (defValIfUndefined(append, true))
        self[self.length++] = series;
      return series;
    };

    var fieldNamePosDict = function(series) {
      var d = {};
      for (var i = 0, l = series.fields.length; i < l; i++)
        d[series.fields[i]] = i;
      return d;
    };

    var init = function() {
      setTimeSeriesType(self, T_TIME_SERIES_SET);
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
                fields: ['timestamp', 'f2', ...],
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



    /******************************\
            Public Methods
    \******************************/

    self.splice = Array.prototype.splice; // Kidding

    /* Walk through all time series in 'self',
      fn=function(index)(this=series), 'each' stops if fn returns false */
    self.each = function(fn) {
      console.log(self);
      console.log(this);
      for (var i = 0; i < self.length; i++)
        if (safeCall(fn, self[i], [i]) === false)
          return;
    };

    /* groupBy(field1, field2, ...)
        in which fieldN is either a field name or a function(row)(this=series)
        whose return value is a digest string, same string => same group
      Only process TimeSeries[0]
    */
    self.groupBy = function(field) {
      var groups = {};
    };

    /* sort all series
        fields: a list of fields, either field names or function(row1, row2)
          returning -1, 0 or 1,
        reversed: false in default
    */
    self.sort = function(fields, reversed) {
      var reversed = defValIfUndefined(reversed, false) ? -1 : 1;
      var fields = defValIfUndefined(fields, [F_TIMESTAMP]);
      var self = (settings.inPlace) ? self : new TimeSeries(self);
      var basicCmp = function(x, y) {
        if (x === y)
          return 0;
        return (x > y) ? 1 : -1;
      };
      self.each(function(index) {
        var series = this;
        var fieldNameToPos = fieldNamePosDict(series);
        series.data.sort(function(x, y) {
          var f = 0;
          for (var i = 0, l = fields.length; i < l; i++)
              if ((isFunction(fields[i]) && (f = fields(x, y)) !== 0) ||
                  (f = basicCmp(x[fieldNameToPos[fields[i]]], 
                                y[fieldsNameToPos[fields[i]]]) !== 0))
                return reversed * f;
          return 0;
        });
      });
      return self;
    };

    /* Do the sum to all fields in all series */
    self.sum = function() {
      var self = (settings.inPlace) ? self : TimeSeries(self);
      var seriesList = [];
      self.each(function(index) {
        var series = this;
        var fieldNameToPos = fieldNamePosDict(series);
        var s = createSeries(false, series, true);
        seriesList.push(s);
        for (var i = 0, w = series.fields.length; i < w; i++)
          s.data[i] = 0;

        for (var i = 0, l = series.data.length, w = series.fields.length; 
              i < l; i++)
          for (var j = 0; j < w; j++)
            s.data[j] += series.data[j];
          
      });
      updateTimeSeriesSet(self, seriesList);
      return self;
    };

    /* select certain fields. Each field should be field-name or index */
    self.selectFields = function(fields) {
      var self = (settings.inPlace) ? self : TimeSeries(self);
      self.each(function(index) {
        var series = this;
        var fieldsNameToPos = fieldNamePosDict(series);
        var selFieldsPos = [];
        for (var i = 0, l = fields.length; i < l; i++)
          selFieldsPos.push(isString(fields[i]) ? 
                            fieldNameToPos[fields[i]] : fields[i]);
        selFieldsPos.sort();
        // Set data
        for (var i = 0, l = series.data.length, 
              w = selFieldsPos.length; i < l; i++) {
          var newRow = [];
          var row = series.data[i];
          for (var j = 0; j < w; j++)
            newRow.push(row[selFieldsPos[j]]);
          series.data[i] = newRow;
        }
        // Set fields
        var newFields = [];
        for (var j = 0, w = selFieldsPos.length; j < w; j++)
          newFields.push(series.fields[j]);
        series.fields = newFields;
      });
      return self;
    };

    /* count of data */
    self.count = function() {
      var self = (settings.inPlace) ? self : TimeSeries(self);
      var seriesList = [];
      self.each(function(index) {
        var series = this;
        var newSeries = createSeries(false);
        newSeries.fields.push(F_COUNT);
        newSeries.data.push(series.data.length);
        seriesList.push(newSeries);
      });
      updateTimeSeriesSet(self, seriesList);
      return self;
    };

    /******************************\
            Init Methods
    \******************************/

    var settings = extend({
      dataType: 'time-dictionary',
      inPlace: true,       // do all operations in place?
    }, defValIfUndefined(options, {}));

    init();
    return self;
  };
}());

/******************************\
       Entry for node.js 
\******************************/
if (typeof exports !== 'undefined')
  exports.TimeSeries = TimeSeries;
