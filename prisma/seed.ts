import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding services…");
  const services = [
    { name: "30-min Dog Walk", description: "A brisk neighbourhood stroll to burn off zoomies.", duration: 30, price: 80, emoji: "🐕", sortOrder: 1 },
    { name: "60-min Dog Walk", description: "A proper adventure walk with sniff breaks and treats.", duration: 60, price: 140, emoji: "🦮", sortOrder: 2 },
    { name: "Drop-in Pet Visit", description: "A 45-min visit: feed, fresh water, cuddles & playtime.", duration: 45, price: 100, emoji: "🐾", sortOrder: 3 },
    { name: "Half-day Pet Sitting", description: "4 hours of company, walks and pampering at home.", duration: 240, price: 250, emoji: "🏠", sortOrder: 4 },
    { name: "Full-day Pet Sitting", description: "8 full hours of dedicated love and care.", duration: 480, price: 450, emoji: "🌞", sortOrder: 5 },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { id: `seed-${s.sortOrder}` },
      update: s,
      create: { id: `seed-${s.sortOrder}`, ...s },
    });
  }

  console.log("📅 Seeding availability rules…");
  // weekdays 15:00 – 18:00 (after school)
  const weekdays = [1, 2, 3, 4, 5];
  for (const day of weekdays) {
    await prisma.availabilityRule.upsert({
      where: { id: `wd-${day}` },
      update: {},
      create: { id: `wd-${day}`, dayOfWeek: day, startTime: "15:00", endTime: "18:00", slotInterval: 30 },
    });
  }
  // weekends 08:00 – 17:00
  for (const day of [0, 6]) {
    await prisma.availabilityRule.upsert({
      where: { id: `we-${day}` },
      update: {},
      create: { id: `we-${day}`, dayOfWeek: day, startTime: "08:00", endTime: "17:00", slotInterval: 30 },
    });
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
