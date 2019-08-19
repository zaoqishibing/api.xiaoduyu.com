import schedule from 'node-schedule'

const calculateData = function () {
    console.log("start schedule")
};

// cron-style
// schedule.scheduleJob('*/5 * * * * *', calculateData);

exports.schedule = schedule;