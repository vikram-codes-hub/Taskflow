import prisma from "../src/config/db.js";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminEmail = "admin@taskflow.com";
  const adminPassword = await bcrypt.hash("admin123456", 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("✅ Admin user already exists");
  } else {
    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: adminEmail,
        password: adminPassword,
        role: "ADMIN",
      },
    });
    console.log("✅ Admin user created:", admin.email);
  }

  // Create test user
  const userEmail = "user@taskflow.com";
  const userPassword = await bcrypt.hash("user123456", 10);

  const existingUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (existingUser) {
    console.log("✅ Test user already exists");
  } else {
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: userEmail,
        password: userPassword,
        role: "USER",
      },
    });
    console.log("✅ Test user created:", user.email);
  }

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
