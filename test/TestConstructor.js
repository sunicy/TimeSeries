ts = require('../TimeSeries');

var data = {fields: ['timestamp', 'name', 'age'],
  data:   [
            [20101234, 'aaa', 20],
            [20109876, '000', 17],
            [20090909, 'zxy', 12],
            [20080808, 'anc', 25],
          ],
};

u.log("Raw Data:").log(data).log();

var timeSeries = new ts.TimeSeries({
  fields: ['timestamp', 'name', 'age'],
  data:   [
            [20101234, 'aaa', 20],
            [20109876, '000', 17],
            [20090909, 'zxy', 12],
            [20080808, 'anc', 25],
          ],
});

console.log("Result:", timeSeries);

var t2 = timeSeries.sort(['timestamp']);

console.log("Result After Sort:", t2);
console.log("Old time series:", timeSeries);

t2.inPlace(true).selectFields(['timestamp', 'age']);
console.log("Result After selectFields:", t2);

var t3 = t2.inPlace(false).sum();
console.log("Result After sum:", t3);

console.log("Result Before count:", t2);
t2.inPlace(true).count();
console.log("Result After count:", t2);
