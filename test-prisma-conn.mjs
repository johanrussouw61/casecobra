import prisma from "./src/app/db/index.js";
(async () => {
  try {
    const r = await prisma.$queryRaw`SELECT 1;`;
    console.log("ok", r);
  } catch (e) {
    console.error("prisma connection error", e);
  } finally {
    await prisma.$disconnect();
  }
})();
