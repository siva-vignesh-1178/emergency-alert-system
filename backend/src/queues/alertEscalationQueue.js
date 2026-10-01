const { Queue } = require("bullmq");
const redisConnection = require("../config/redis");

const alertEscalationQueue = new Queue("alert-escalation", {
  connection: redisConnection,
});

module.exports = alertEscalationQueue;
