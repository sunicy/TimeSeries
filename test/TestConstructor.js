u = require('./TestUtils');
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

u.log("Result:").log(timeSeries).log();

timeSeries.sort('timestamp');

u.log("Result After Sort:").log(timeSeries).log();
