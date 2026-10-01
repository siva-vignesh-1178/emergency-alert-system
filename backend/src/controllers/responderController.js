const {
  prisma
} = require("../config/database");


async function createResponder(req, res) {

  try {

    const {
      userId,
      type,
      tier
    } = req.body;


    if (!userId || !type || !tier) {

      return res.status(400).json({
        success: false,
        message:
          "userId, type and tier are required"
      });

    }


    if (
      !["SECURITY", "MEDICAL"]
        .includes(type)
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Type must be SECURITY or MEDICAL"
      });

    }


    const responder =
      await prisma.responder.create({

        data: {

          userId,

          type,

          tier: Number(tier)

        },

        include: {

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }

        }

      });


    await prisma.user.update({

      where: {
        id: userId
      },

      data: {
        role: "RESPONDER"
      }

    });


    return res.status(201).json({

      success: true,

      message:
        "Responder created",

      data: responder

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to create responder"
    });

  }

}


async function getResponders(req, res) {

  try {

    const responders =
      await prisma.responder.findMany({

        include: {

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              isActive: true
            }
          }

        },

        orderBy: [
          {
            type: "asc"
          },
          {
            tier: "asc"
          }
        ]

      });


    return res.json({

      success: true,

      count:
        responders.length,

      data: responders

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch responders"
    });

  }

}


async function updateAvailability(req, res) {

  try {

    const {
      isAvailable
    } = req.body;


    if (
      typeof isAvailable !==
      "boolean"
    ) {

      return res.status(400).json({
        success: false,
        message:
          "isAvailable must be true or false"
      });

    }


    const responder =
      await prisma.responder.update({

        where: {
          userId:
            req.user.userId
        },

        data: {
          isAvailable
        }

      });


    return res.json({

      success: true,

      message:
        "Availability updated",

      data: responder

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to update availability"
    });

  }

}


module.exports = {
  createResponder,
  getResponders,
  updateAvailability
};