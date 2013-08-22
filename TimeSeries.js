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

    var is = function(type, obj) {
      var clas = Object.prototype.toString.call(obj).slice(8, -1);
      return obj !== undefined && obj !== null && clas === type;
    };

    var isFunction = function(v) {
      return is('Function', v);
    };

    var isString = function(v) {
      return is('String', v);
    };

    var isArray = function(v) {
      return is('Array', v);
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
          id: '',
        };
      if (!isUndefined(rawData)) {// Do the deepcopy
        series.fields = plainDeepCopy(rawData.fields);
        series.id = defValIfUndefined(rawData.id, '');
        if (noData !== true)
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

    var rowListToDict = function(fields, rowList) {
      var dict = {};
      for (var i = 0, l = fields.length; i < l; i++) {
        // Act as PHP, both 'field name' and 'field id'
        dict[fields[i]] = rowList[i];
        dict[i] = rowList[i];
      }
      return dict;
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
      for (var i = 0; i < self.length; i++)
        if (safeCall(fn, self[i], [i]) === false)
          return;
    };

    /* groupBy(fields)
        fields is a list in which each is either a 
        field name or a function(row)(this=series)
        whose return value is a digest string, same string => same group
      Only process TimeSeries[0]
    */
    self.groupBy = function(fields) {
      var groups = {};
      var _self = (settings.inPlace) ? self : 
                  new TimeSeries(self, {inPlace: settings.inPlace});
      var series = self[0];
      var fieldNameToPos = fieldNamePosDict(series);
      for (var i = 0, l = series.data.length, w = fields.length;
            i < l; i++) {
        var digest = [];
        for (var j = 0; j < w; j++) {
          if (isFunction(fields[j]))
            digest.push(fields[j].call(series, rowListToDict(series.fields, 
                                                            series.data[i])));
          else
            digest.push(series.data[i][fieldNameToPos[fields[j]]]);
        }
        digest = digest.join("||");

        if (!(digest in groups)) {
          // if this group doesn't exist, create a new series
          groups[digest] = createSeries(false, series, true);
          groups[digest].id = digest;
        }
        groups[digest].data.push(plainDeepCopy(series.data[i]));
      }

      // groups => new arrays
      var seriesList = [];
      foreach(groups, function(digest, index, groups) {
        seriesList.push(groups[digest]);
      });
      updateTimeSeriesSet(_self, seriesList);
      return _self;
    };

    /* add a new column to fields 
        fnCalc: function(index, row)(this=series), returns a value
    */
    self.addField = function(fieldName, fnCalc) {
      var _self = (settings.inPlace) ? self : 
                  new TimeSeries(self, {inPlace: settings.inPlace});
      if (!isFunction(fnCalc))
        return _self; // Failed!

      _self.each(function(index) {
        var series = this;
        var fields = series.fields;
        var data = series.data;
        for (var i = 0, l = data.length; i < l; i++)
          data[i].push(fnCalc.call(series, i, rowListToDict(fields, data[i])));
        fields.push(fieldName);
      });
      return _self;
    };

    self.filter = function(fnFilter) {
      var _self = (settings.inPlace) ? self : 
                  new TimeSeries(self, {inPlace: settings.inPlace});
      if (!isFunction(fnFilter))
        return _self; //Failed!

      _self.each(function(index) {
        var series = this;
        var fields = series.fields;
        var data = series.data;
        for (var i = 0, r = 0, l = data.length; i < l; i++) {
          if (fnFilter.call(series, rowListToDict(fields, data[i])) !== false) {
            data[r] = data[i];
            ++r; // do not delete
          }
        }
        series.data = data.slice(0, r);
      });
      return _self;
    };

    /* sort all series
        fields: a list of fields, either field names or function(row1, row2)
          returning -1, 0 or 1,
        reversed: false in default
    */
    self.sort = function(fields, reversed) {
      var reversed = defValIfUndefined(reversed, false) ? -1 : 1;
      var fields = defValIfUndefined(fields, [F_TIMESTAMP]);
      var _self = (settings.inPlace) ? self : 
                  new TimeSeries(self, {inPlace: settings.inPlace});
      var basicCmp = function(x, y) { // compare function for atom types
        if (x === y)
          return 0;
        return (x > y) ? 1 : -1;
      };
      _self.each(function(index) {
        var series = this;
        var fieldNameToPos = fieldNamePosDict(series);
        series.data.sort(function(x, y) {
          var f = 0;
          for (var i = 0, l = fields.length; i < l; i++)
              // if it's a function, call it; use basicCmp instead
              if ((isFunction(fields[i]) && 
                    (f = fields(rowListToDict(series.fields, x), 
                                rowListToDict(series.fields, y))) !== 0) ||
                  (f = basicCmp(x[fieldNameToPos[fields[i]]], 
                                y[fieldNameToPos[fields[i]]])) !== 0)
                return reversed * f;
          return 0;
        });
      });
      return _self;
    };

    /* Do the sum to all fields in all series */
    self.sum = function() {
      var _self = (settings.inPlace) ? self : 
                  new TimeSeries(self, {inPlace: settings.inPlace});
      var seriesList = [];
      _self.each(function(index) {
        var series = this;
        var fieldNameToPos = fieldNamePosDict(series);
        var s = createSeries(false, series, true);
        seriesList.push(s);

        s.data[0] = [];
        for (var j = 0, w = series.fields.length; j < w; j++)
          s.data[0][j] = 0;

        for (var i = 0, l = series.data.length, w = series.fields.length; 
              i < l; i++)
          for (var j = 0; j < w; j++)
            s.data[0][j] += series.data[i][j];
          
      });
      updateTimeSeriesSet(_self, seriesList);
      return _self;
    };

    /* select certain fields. Each field should be field-name or index */
    self.selectFields = function(fields) {
      var _self = (settings.inPlace) ? self : 
                  new TimeSeries(self, {inPlace: settings.inPlace});
      _self.each(function(index) {
        var series = this;
        var fieldNameToPos = fieldNamePosDict(series);
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
          newFields.push(series.fields[selFieldsPos[j]]);
        series.fields = newFields;
      });
      return _self;
    };

    /* count of data */
    self.count = function() {
      var _self = (settings.inPlace) ? self : 
                  new TimeSeries(self, {inPlace: settings.inPlace});
      var seriesList = [];
      _self.each(function(index) {
        var series = this;
        var newSeries = createSeries(false, series, true);
        newSeries.fields = [F_COUNT];
        newSeries.data.push(series.data.length);
        seriesList.push(newSeries);
      });
      updateTimeSeriesSet(_self, seriesList);
      return _self;
    };

    /* slice each series */
    self.slice = function(begin, end) {
      var _self = (settings.inPlace) ? self : 
                  new TimeSeries(self, {inPlace: settings.inPlace});
      _self.each(function(index) {
        var series = this;
        // IE seems not to support slice(begin, undefined)
        series.data = isUndefined(end) ? series.data.slice(begin) :
                                        series.data.slice(begin, end);
      });
      return _self;
    };

    /* first n items for each series */
    self.first = function(n) {
      return self.slice(0, n);
    };

    /* first n items for each series */
    self.last = function(n) {
      return self.slice(-n);
    };

    self.inPlace = function(_inPlace) {
      if (isUndefined(_inPlace))
        return settings.inPlace;
      settings.inPlace = _inPlace;
      return self;
    };

    /* fetch data from the first series, arranged by columns */
    self.columns = function() {
      var series = self[0];
      var cols = {};
      foreach(series.fields, function(i, index, fields) {
        cols[i] = cols[fields[i]] = [];
      });
      for (var i = 0, l = series.data.length, w = series.fields.length;
                i < l; i++)
        for (var j = 0; j < w; j++)
          cols[j].push(series.data[i][j]);
      return cols;
    };

    /******************************\
            Init Methods
    \******************************/

    var settings = extend({
      dataType: 'time-dictionary',
      inPlace: false,       // do all operations in place?
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
