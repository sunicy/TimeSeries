if (typeof require !== 'undefined') {
  ts = require('../TimeSeries');
  u = require('./TestUtils');
}
else {
  u = {
        'log': console.log,
      };
  ts = {
        'TimeSeries': TimeSeries,
        'TS': TS,
      };
}

var data = {fields: ['timestamp', 'name', 'age'],
  data:   [
            [20101234, 'aaa', 20],
            [20101234, '000', 17],
            [20090909, 'zxy', 17],
            [20080808, 'anc', 25],
            [20080808, 'abc', 25],
            [20080808, 'adc', 25],
            [20080809, 'aec', 25],
            [20080808, 'afc', 25],
            [20080808, 'agc', 25],
          ],
};

console.log("Raw Data:", data);

var timeSeries = TS(data);
timeSeries.sort().groupBy(['timestamp']);

console.log("Result:", timeSeries);

var t2 = timeSeries.sort(['timestamp']);

console.log("Result After Sort:", t2);
console.log("Old time series:", timeSeries);

t2.inPlace(true).selectFields(['timestamp', 'age']);
console.log("Result After selectFields:", t2);

var t3 = t2.inPlace(false).sum();
console.log("Result After sum:", t3);

console.log("Result Before count:", t2);
t3 = t2.inPlace(false).count();
console.log("Result After count:", t3);

t3 = t2.groupBy(['age']);
console.log("Result After group(): ", t3);

t3 = t3.addField('year', function(index, row) {
  console.log("row ", index, ":", row);
  return Math.floor(row.timestamp / 10000);
});
console.log("Result After Adding 'year'");
console.log(t3);


t3 = t3.filter(function(row) {
  return row['year'] > 2008;
});
console.log("Result After filter:");
console.log(t3);
