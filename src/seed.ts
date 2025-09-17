import { PrismaClient, Role, AppointmentStatus, InvoiceStatus, PaymentMethod } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data (order matters due to FKs)
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.appointmentService.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.staffAvailability.deleteMany();
  await prisma.staffServiceSkill.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const admin = await prisma.user.create({
    data: {
      email: "admin@salon.local",
      passwordHash: "dev-only-not-real",
      role: Role.ADMIN,
      firstName: "Alex",
      lastName: "Admin",
    },
  });

  const staffUser1 = await prisma.user.create({
    data: {
      email: "stylist1@salon.local",
      passwordHash: "dev-only-not-real",
      role: Role.STAFF,
      firstName: "Sam",
      lastName: "Stylist",
    },
  });

  const staffUser2 = await prisma.user.create({
    data: {
      email: "beautician@salon.local",
      passwordHash: "dev-only-not-real",
      role: Role.STAFF,
      firstName: "Bella",
      lastName: "Beautician",
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: "customer@salon.local",
      passwordHash: "dev-only-not-real",
      role: Role.CUSTOMER,
      firstName: "Casey",
      lastName: "Customer",
    },
  });

  // Profiles
  const staff1 = await prisma.staff.create({ data: { userId: staffUser1.id, title: "Senior Stylist" } });
  const staff2 = await prisma.staff.create({ data: { userId: staffUser2.id, title: "Beautician" } });
  const customer = await prisma.customer.create({ data: { userId: customerUser.id, notes: "Allergic to some dyes." } });

  // Categories & Services
  const hairCat = await prisma.serviceCategory.create({ data: { name: "Hair" } });
  const skinCat = await prisma.serviceCategory.create({ data: { name: "Skin" } });

  const haircut = await prisma.service.create({
    data: {
      name: "Haircut",
      description: "Wash, cut, and style",
      priceCents: 3000,
      durationMin: 45,
      categoryId: hairCat.id,
    },
  });

  const coloring = await prisma.service.create({
    data: {
      name: "Hair Coloring",
      priceCents: 8000,
      durationMin: 120,
      categoryId: hairCat.id,
    },
  });

  const facial = await prisma.service.create({
    data: {
      name: "Facial",
      priceCents: 5000,
      durationMin: 60,
      categoryId: skinCat.id,
    },
  });

  // Staff Skills
  await prisma.staffServiceSkill.createMany({
    data: [
      { staffId: staff1.id, serviceId: haircut.id, proficiency: 5 },
      { staffId: staff1.id, serviceId: coloring.id, proficiency: 4 },
      { staffId: staff2.id, serviceId: facial.id, proficiency: 5 },
    ],
  });

  // Availability: simple 9-5 weekdays
  const days = [1, 2, 3, 4, 5];
  await prisma.staffAvailability.createMany({
    data: days.flatMap((dow) => [
      { staffId: staff1.id, dayOfWeek: dow, startMin: 9 * 60, endMin: 17 * 60 },
      { staffId: staff2.id, dayOfWeek: dow, startMin: 10 * 60, endMin: 18 * 60 },
    ]),
  });

  // Inventory
  await prisma.inventoryItem.createMany({
    data: [
      { sku: "DYE-RED-100", name: "Red Hair Dye", quantity: 10, lowStockLevel: 3 },
      { sku: "SHAMPOO-1L", name: "Shampoo 1L", quantity: 20, lowStockLevel: 5 },
    ],
  });

  // Appointment with multiple services
  const now = new Date();
  const starts = new Date(now.getTime() + 24 * 60 * 60 * 1000); // tomorrow
  const ends = new Date(starts.getTime() + (45 + 60) * 60 * 1000);

  const appointment = await prisma.appointment.create({
    data: {
      customerId: customer.id,
      staffId: staff1.id,
      startsAt: starts,
      endsAt: ends,
      status: AppointmentStatus.CONFIRMED,
      notes: "Customer prefers natural style.",
    },
  });

  await prisma.appointmentService.createMany({
    data: [
      { appointmentId: appointment.id, serviceId: haircut.id, priceCents: 3000, durationMin: 45, orderIndex: 0 },
      { appointmentId: appointment.id, serviceId: facial.id, priceCents: 5000, durationMin: 60, orderIndex: 1 },
    ],
  });

  // Invoice & Payment
  const invoice = await prisma.invoice.create({
    data: {
      appointmentId: appointment.id,
      customerId: customer.id,
      subtotalCents: 8000,
      taxCents: 640,
      totalCents: 8640,
      status: InvoiceStatus.PARTIALLY_PAID,
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      method: PaymentMethod.CARD,
      amountCents: 4000,
      reference: "AUTH123",
    },
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

