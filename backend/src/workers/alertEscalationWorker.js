require("dotenv").config();

const { Worker } = require("bullmq");
const { prisma } = require("../config/database");
const redisConnection = require("../config/redis");

const escalationWorker = new Worker(
  "alert-escalation",

  async (job) => {
    const { alertId } = job.data;

    console.log(`?? Processing escalation for alert: ${alertId}`);

    const alert = await prisma.alert.findUnique({
      where: { id: alertId }
    });

    if (!alert) {
      console.log(`?? Alert not found: ${alertId}`);
      return;
    }

    // If the student alert was already handled, don't escalate it.
    if (
      alert.status === "ACKNOWLEDGED" ||
      alert.status === "RESOLVED" ||
      alert.status === "CANCELLED"
    ) {
      console.log(
        `?? Alert ${alertId} is already ${alert.status}. No escalation needed.`
      );
      return;
    }

    const nextTier = alert.currentTier + 1;

    const responderType =
      alert.category === "SECURITY" ? "SECURITY" : "MEDICAL";

    // Find an available responder in the next tier.
    const responder = await prisma.responder.findFirst({
      where: {
        type: responderType,
        tier: nextTier,
        isAvailable: true
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    if (!responder) {
      console.log(
        `?? No available ${responderType} responder found for Tier ${nextTier}.`
      );
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.alert.update({
        where: { id: alertId },
        data: {
          status: "ESCALATED",
          currentTier: nextTier,
          escalatedAt: new Date()
        }
      });

      await tx.escalationHistory.create({
        data: {
          alertId,
          responderId: responder.id,
          fromTier: alert.currentTier,
          toTier: nextTier,
          reason: `Alert was not acknowledged within the escalation timeout. Escalated to Tier ${nextTier}.`
        }
      });

      await tx.auditLog.create({
        data: {
          alertId,
          action: "ESCALATED",
          details: {
            fromTier: alert.currentTier,
            toTier: nextTier,
            responderId: responder.id,
            reason: "Acknowledgment timeout"
          }
        }
      });
    });

    console.log(
      `?? Alert ${alertId} escalated from Tier ${alert.currentTier} to Tier ${nextTier}`
    );

    console.log(
      `?? Responder selected: ${responder.userId}`
    );
  },

  {
    connection: redisConnection
  }
);

escalationWorker.on("completed", (job) => {
  console.log(`? Escalation job completed: ${job.id}`);
});

escalationWorker.on("failed", (job, error) => {
  console.error(
    `? Escalation job failed: ${job?.id}`,
    error.message
  );
});

console.log("?? Real alert escalation worker started");

module.exports = escalationWorker;
