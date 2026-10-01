const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function connectDatabase() {
  try {
    await prisma.$connect();

    console.log("✅ PostgreSQL connected");
  } catch (error) {
    console.error("❌ PostgreSQL connection failed");
    console.error(error);

    process.exit(1);
  }
}

module.exports = {
  prisma,
  connectDatabase
};