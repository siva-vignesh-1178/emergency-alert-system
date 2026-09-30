const {
  prisma
} = require("../config/database");


async function createAlert(req, res) {

  try {

    const {
      category,
      latitude,
      longitude,
      accuracy,
      message
    } = req.body;


    if (
      !category ||
      latitude === undefined ||
      longitude === undefined
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Category, latitude and longitude are required"
      });

    }


    if (
      !["SECURITY", "MEDICAL"]
        .includes(category)
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Category must be SECURITY or MEDICAL"
      });

    }


    const lat = Number(latitude);
    const lng = Number(longitude);


    if (
      Number.isNaN(lat) ||
      Number.isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {

      return res.status(400).json({
        success: false,
        message: "Invalid GPS coordinates"
      });

    }


    const alert =
      await prisma.$transaction(
        async (tx) => {

          const createdAlert =
            await tx.alert.create({

              data: {

                studentId:
                  req.user.userId,

                category,

                latitude: lat,

                longitude: lng,

                accuracy:
                  accuracy
                    ? Number(accuracy)
                    : null,

                message:
                  message || null,

                status: "PENDING",

                currentTier: 1

              }

            });


          await tx.auditLog.create({

            data: {

              alertId:
                createdAlert.id,

              userId:
                req.user.userId,

              action: "CREATED",

              details: {
                category,
                latitude: lat,
                longitude: lng
              }

            }

          });


          return createdAlert;

        }
      );


    const io =
      req.app.get("io");


    if (io) {

      io.emit(
        "new-alert",
        alert
      );

    }


    return res.status(201).json({

      success: true,

      message:
        "Emergency alert created",

      data: alert

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to create emergency alert"
    });

  }

}


async function getMyAlerts(req, res) {

  try {

    const alerts =
      await prisma.alert.findMany({

        where: {
          studentId:
            req.user.userId
        },

        orderBy: {
          createdAt: "desc"
        }

      });


    return res.json({

      success: true,

      count: alerts.length,

      data: alerts

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch alerts"
    });

  }

}


async function getAllAlerts(req, res) {

  try {

    const {
      status,
      category
    } = req.query;


    const where = {};


    if (status) {
      where.status = status;
    }


    if (category) {
      where.category = category;
    }


    const alerts =
      await prisma.alert.findMany({

        where,

        include: {

          student: {
            select: {
              id: true,
              name: true,
              email: true,
              studentId: true,
              phone: true
            }
          },

          acknowledgments: true,

          escalations: true,

          auditLogs: {
            orderBy: {
              createdAt: "asc"
            }
          }

        },

        orderBy: {
          createdAt: "desc"
        }

      });


    return res.json({

      success: true,

      count: alerts.length,

      data: alerts

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch alerts"
    });

  }

}


async function getAlertById(req, res) {

  try {

    const {
      id
    } = req.params;


    const alert =
      await prisma.alert.findUnique({

        where: {
          id
        },

        include: {

          student: true,

          acknowledgments: true,

          escalations: {
            orderBy: {
              createdAt: "asc"
            }
          },

          auditLogs: {
            orderBy: {
              createdAt: "asc"
            }
          }

        }

      });


    if (!alert) {

      return res.status(404).json({
        success: false,
        message: "Alert not found"
      });

    }


    return res.json({

      success: true,

      data: alert

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch alert"
    });

  }

}


async function acknowledgeAlert(req, res) {

  try {

    const {
      id
    } = req.params;


    const {
      notes
    } = req.body;


    const responder =
      await prisma.responder.findUnique({

        where: {
          userId:
            req.user.userId
        }

      });


    if (!responder) {

      return res.status(403).json({
        success: false,
        message:
          "Responder profile not found"
      });

    }


    const alert =
      await prisma.alert.findUnique({

        where: {
          id
        }

      });


    if (!alert) {

      return res.status(404).json({
        success: false,
        message: "Alert not found"
      });

    }


    if (
      alert.status === "RESOLVED" ||
      alert.status === "CANCELLED"
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Alert cannot be acknowledged"
      });

    }


    const result =
      await prisma.$transaction(
        async (tx) => {

          const acknowledgment =
            await tx.acknowledgment.upsert({

              where: {

                alertId_responderId: {
                  alertId: id,
                  responderId: responder.id
                }

              },

              update: {
                notes: notes || null,
                acknowledgedAt: new Date()
              },

              create: {
                alertId: id,
                responderId: responder.id,
                notes: notes || null
              }

            });


          const updatedAlert =
            await tx.alert.update({

              where: {
                id
              },

              data: {

                status:
                  "ACKNOWLEDGED",

                acknowledgedAt:
                  new Date()

              }

            });


          await tx.auditLog.create({

            data: {

              alertId: id,

              userId:
                req.user.userId,

              action:
                "ACKNOWLEDGED",

              details: {
                responderId:
                  responder.id
              }

            }

          });


          return {
            acknowledgment,
            updatedAlert
          };

        }
      );


    const io =
      req.app.get("io");


    if (io) {

      io.emit(
        "alert-acknowledged",
        result.updatedAlert
      );

    }


    return res.json({

      success: true,

      message:
        "Alert acknowledged",

      data: result

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to acknowledge alert"
    });

  }

}


async function resolveAlert(req, res) {

  try {

    const {
      id
    } = req.params;


    const alert =
      await prisma.alert.findUnique({

        where: {
          id
        }

      });


    if (!alert) {

      return res.status(404).json({
        success: false,
        message: "Alert not found"
      });

    }


    const updatedAlert =
      await prisma.$transaction(
        async (tx) => {

          const updated =
            await tx.alert.update({

              where: {
                id
              },

              data: {

                status:
                  "RESOLVED",

                resolvedAt:
                  new Date()

              }

            });


          await tx.auditLog.create({

            data: {

              alertId: id,

              userId:
                req.user.userId,

              action:
                "RESOLVED",

              details: {}

            }

          });


          return updated;

        }
      );


    const io =
      req.app.get("io");


    if (io) {

      io.emit(
        "alert-resolved",
        updatedAlert
      );

    }


    return res.json({

      success: true,

      message:
        "Alert resolved",

      data: updatedAlert

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to resolve alert"
    });

  }

}


async function cancelAlert(req, res) {

  try {

    const {
      id
    } = req.params;


    const alert =
      await prisma.alert.findUnique({

        where: {
          id
        }

      });


    if (!alert) {

      return res.status(404).json({
        success: false,
        message: "Alert not found"
      });

    }


    if (
      alert.studentId !==
      req.user.userId
    ) {

      return res.status(403).json({
        success: false,
        message:
          "You can only cancel your own alert"
      });

    }


    const updatedAlert =
      await prisma.alert.update({

        where: {
          id
        },

        data: {

          status:
            "CANCELLED",

          cancelledAt:
            new Date()

        }

      });


    await prisma.auditLog.create({

      data: {

        alertId: id,

        userId:
          req.user.userId,

        action:
          "CANCELLED",

        details: {}

      }

    });


    const io =
      req.app.get("io");


    if (io) {

      io.emit(
        "alert-cancelled",
        updatedAlert
      );

    }


    return res.json({

      success: true,

      message:
        "Alert cancelled",

      data: updatedAlert

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to cancel alert"
    });

  }

}


module.exports = {
  createAlert,
  getMyAlerts,
  getAllAlerts,
  getAlertById,
  acknowledgeAlert,
  resolveAlert,
  cancelAlert
};