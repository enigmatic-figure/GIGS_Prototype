import {
  BookingStatus,
  InvoiceStatus,
  JobStatus,
  PayoutStatus,
  PrismaClient,
  Role,
  type Booking,
  type EmployerProfile,
  type JobPosting,
  type WorkerProfile,
} from "@prisma/client";

if (!process.env.DATABASE_URL) {
  console.warn("⚠️ Skipping seed: DATABASE_URL is not defined.");
  process.exit(0);
}

const prisma = new PrismaClient();

type WorkerSeed = {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  minRate: number;
  maxRate: number;
  radiusKm: number;
  homeLat: number;
  homeLng: number;
};

type EmployerSeed = {
  contact: string;
  email: string;
  phone: string;
  company: string;
  website?: string;
};

type JobSeed = {
  employerIndex: number;
  title: string;
  description: string;
  location: string;
  lat?: number;
  lng?: number;
  dayOffset: number;
  startHour: number;
  durationHours: number;
  neededRoles: string[];
  headcount: number;
  rate: number;
  status?: JobStatus;
};

const workerSeedData: WorkerSeed[] = [
  {
    name: "Alex Stage",
    email: "alex.stage@gigs.test",
    phone: "+1-555-1001",
    skills: ["Stagehand", "Setup/Teardown"],
    minRate: 22,
    maxRate: 35,
    radiusKm: 40,
    homeLat: 40.7128,
    homeLng: -74.006,
  },
  {
    name: "Brooke Usher",
    email: "brooke.usher@gigs.test",
    phone: "+1-555-1002",
    skills: ["Usher", "FOH"],
    minRate: 18,
    maxRate: 28,
    radiusKm: 30,
    homeLat: 40.7306,
    homeLng: -73.9352,
  },
  {
    name: "Carlos Tickets",
    email: "carlos.tickets@gigs.test",
    phone: "+1-555-1003",
    skills: ["Ticketing", "FOH"],
    minRate: 20,
    maxRate: 32,
    radiusKm: 35,
    homeLat: 40.741,
    homeLng: -73.9897,
  },
  {
    name: "Dana Concessions",
    email: "dana.concessions@gigs.test",
    phone: "+1-555-1004",
    skills: ["Concessions", "Runner"],
    minRate: 19,
    maxRate: 30,
    radiusKm: 25,
    homeLat: 40.706,
    homeLng: -74.0086,
  },
  {
    name: "Elliot Runner",
    email: "elliot.runner@gigs.test",
    phone: "+1-555-1005",
    skills: ["Runner", "Setup/Teardown"],
    minRate: 21,
    maxRate: 34,
    radiusKm: 50,
    homeLat: 40.758,
    homeLng: -73.9855,
  },
  {
    name: "Farah FOH",
    email: "farah.foh@gigs.test",
    phone: "+1-555-1006",
    skills: ["FOH", "Usher"],
    minRate: 20,
    maxRate: 31,
    radiusKm: 32,
    homeLat: 40.6782,
    homeLng: -73.9442,
  },
  {
    name: "Gabe Rigger",
    email: "gabe.rigger@gigs.test",
    phone: "+1-555-1007",
    skills: ["Stagehand", "Setup/Teardown"],
    minRate: 24,
    maxRate: 36,
    radiusKm: 45,
    homeLat: 40.6501,
    homeLng: -73.9496,
  },
  {
    name: "Hana Hospitality",
    email: "hana.hospitality@gigs.test",
    phone: "+1-555-1008",
    skills: ["Concessions", "Usher"],
    minRate: 18,
    maxRate: 27,
    radiusKm: 20,
    homeLat: 40.7122,
    homeLng: -73.9797,
  },
  {
    name: "Iris Access",
    email: "iris.access@gigs.test",
    phone: "+1-555-1009",
    skills: ["Ticketing", "FOH"],
    minRate: 21,
    maxRate: 33,
    radiusKm: 28,
    homeLat: 40.7614,
    homeLng: -73.9776,
  },
  {
    name: "Jamal Flex",
    email: "jamal.flex@gigs.test",
    phone: "+1-555-1010",
    skills: ["Runner", "Stagehand"],
    minRate: 23,
    maxRate: 34,
    radiusKm: 38,
    homeLat: 40.7484,
    homeLng: -73.9857,
  },
];

const employerSeedData: EmployerSeed[] = [
  {
    contact: "Maya Thompson",
    email: "maya@luminouslive.test",
    phone: "+1-555-2001",
    company: "Luminous Live Productions",
    website: "https://luminouslive.test",
  },
  {
    contact: "Andre Collins",
    email: "andre@harborsidevenues.test",
    phone: "+1-555-2002",
    company: "Harborside Venues",
    website: "https://harborsidevenues.test",
  },
  {
    contact: "Sophie Nguyen",
    email: "sophie@grandstandarena.test",
    phone: "+1-555-2003",
    company: "Grandstand Arena",
    website: "https://grandstandarena.test",
  },
  {
    contact: "Rafael Ortiz",
    email: "rafael@skylineevents.test",
    phone: "+1-555-2004",
    company: "Skyline Events",
  },
  {
    contact: "Priya Desai",
    email: "priya@cityfestivals.test",
    phone: "+1-555-2005",
    company: "City Festivals Co.",
    website: "https://cityfestivals.test",
  },
];

const jobSeedData: JobSeed[] = [
  {
    employerIndex: 0,
    title: "Summer Concert Setup Crew",
    description: "Assist with stage build, lighting rigging, and load-in for a weekend concert series.",
    location: "Brooklyn, NY",
    lat: 40.6782,
    lng: -73.9442,
    dayOffset: 5,
    startHour: 14,
    durationHours: 8,
    neededRoles: ["Stagehand", "Setup/Teardown"],
    headcount: 6,
    rate: 28,
    status: JobStatus.OPEN,
  },
  {
    employerIndex: 1,
    title: "Harborside Gala Ushers",
    description: "Support VIP guest arrivals, ticket scanning, and seat escorting for an evening gala.",
    location: "Jersey City, NJ",
    lat: 40.7282,
    lng: -74.0776,
    dayOffset: 9,
    startHour: 22,
    durationHours: 6,
    neededRoles: ["Usher", "FOH"],
    headcount: 8,
    rate: 24,
    status: JobStatus.PARTIALLY_FILLED,
  },
  {
    employerIndex: 2,
    title: "Arena Ticketing Team",
    description: "Manage ticket windows, scanning, and customer questions for a championship game.",
    location: "Newark, NJ",
    lat: 40.7357,
    lng: -74.1724,
    dayOffset: 12,
    startHour: 16,
    durationHours: 7,
    neededRoles: ["Ticketing", "FOH"],
    headcount: 10,
    rate: 26,
    status: JobStatus.OPEN,
  },
  {
    employerIndex: 3,
    title: "Food Festival Concessions",
    description: "Operate vendor booths, manage lines, and keep service areas stocked for a city food fest.",
    location: "Queens, NY",
    lat: 40.7282,
    lng: -73.7949,
    dayOffset: 16,
    startHour: 10,
    durationHours: 10,
    neededRoles: ["Concessions", "Runner"],
    headcount: 12,
    rate: 22,
  },
  {
    employerIndex: 4,
    title: "Trade Show Floor Team",
    description: "Assist exhibitors with booth setup, registration, and attendee guidance at a tech expo.",
    location: "Manhattan, NY",
    lat: 40.758,
    lng: -73.9855,
    dayOffset: 20,
    startHour: 8,
    durationHours: 9,
    neededRoles: ["Runner", "Setup/Teardown", "FOH"],
    headcount: 9,
    rate: 27,
  },
  {
    employerIndex: 0,
    title: "Outdoor Fair Support",
    description: "Provide general event support including admissions, wayfinding, and concessions assistance.",
    location: "Bronx, NY",
    lat: 40.8448,
    lng: -73.8648,
    dayOffset: 22,
    startHour: 9,
    durationHours: 8,
    neededRoles: ["Usher", "Ticketing", "Concessions"],
    headcount: 10,
    rate: 23,
  },
  {
    employerIndex: 1,
    title: "Convention Center Changeover",
    description: "Overnight crew to break down exhibits and reset rooms for the next day's sessions.",
    location: "Secaucus, NJ",
    lat: 40.7895,
    lng: -74.0565,
    dayOffset: 25,
    startHour: 1,
    durationHours: 7,
    neededRoles: ["Setup/Teardown", "Stagehand"],
    headcount: 7,
    rate: 29,
    status: JobStatus.OPEN,
  },
  {
    employerIndex: 2,
    title: "VIP Lounge Hosts",
    description: "Hospitality-focused team to greet and manage VIP lounge guests during a music festival.",
    location: "Brooklyn, NY",
    lat: 40.695,
    lng: -73.9496,
    dayOffset: 28,
    startHour: 15,
    durationHours: 6,
    neededRoles: ["FOH", "Usher"],
    headcount: 5,
    rate: 25,
  },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
}

function randomSubset(values: string[]): string[] {
  const shuffled = [...values].sort(() => Math.random() - 0.5);
  const take = Math.max(1, randomInt(1, values.length));
  return shuffled.slice(0, take);
}

function generateAvailability(skills: string[], baseMinRate: number) {
  const slotCount = randomInt(2, 4);
  const now = startOfUtcDay(new Date());
  return Array.from({ length: slotCount }, () => {
    const dayOffset = randomInt(1, 30);
    const startHour = randomInt(6, 18);
    const duration = randomInt(4, 8);
    const start = new Date(now);
    start.setUTCDate(start.getUTCDate() + dayOffset);
    start.setUTCHours(startHour, 0, 0, 0);
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
    const minRate = Math.max(16, baseMinRate - randomInt(0, 3));
    return {
      start,
      end,
      rolesOk: randomSubset(skills),
      minRate,
    };
  });
}

function jobStartDate(dayOffset: number, startHour: number): Date {
  const base = startOfUtcDay(new Date());
  const start = new Date(base);
  start.setUTCDate(start.getUTCDate() + dayOffset);
  start.setUTCHours(startHour, 0, 0, 0);
  return start;
}

async function main() {
  console.log("🌱 Seeding database with demo data...");

  await prisma.payout.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.jobPosting.deleteMany();
  await prisma.workerProfile.deleteMany();
  await prisma.employerProfile.deleteMany();
  await prisma.user.deleteMany();

  const workerProfiles: WorkerProfile[] = [];

  for (const worker of workerSeedData) {
    const availability = generateAvailability(worker.skills, worker.minRate);
    const created = await prisma.user.create({
      data: {
        email: worker.email,
        name: worker.name,
        phone: worker.phone,
        role: Role.WORKER,
        workerProfile: {
          create: {
            skills: worker.skills,
            minRate: worker.minRate,
            maxRate: worker.maxRate,
            radiusKm: worker.radiusKm,
            homeLat: worker.homeLat,
            homeLng: worker.homeLng,
            availability: {
              create: availability.map((slot) => ({
                start: slot.start,
                end: slot.end,
                rolesOk: slot.rolesOk,
                minRate: slot.minRate,
              })),
            },
          },
        },
      },
      include: { workerProfile: { include: { availability: true } } },
    });

    if (!created.workerProfile) {
      throw new Error(`Failed to create worker profile for ${worker.email}`);
    }

    workerProfiles.push(created.workerProfile);
  }

  const employerProfiles: EmployerProfile[] = [];

  for (const employer of employerSeedData) {
    const created = await prisma.user.create({
      data: {
        email: employer.email,
        name: employer.contact,
        phone: employer.phone,
        role: Role.EMPLOYER,
        employerProfile: {
          create: {
            company: employer.company,
            website: employer.website,
          },
        },
      },
      include: { employerProfile: true },
    });

    if (!created.employerProfile) {
      throw new Error(`Failed to create employer profile for ${employer.email}`);
    }

    employerProfiles.push(created.employerProfile);
  }

  await prisma.user.create({
    data: {
      email: "admin@gigs.test",
      name: "GIGS Admin",
      role: Role.ADMIN,
    },
  });

  const jobRecords: JobPosting[] = [];

  for (const job of jobSeedData) {
    const start = jobStartDate(job.dayOffset, job.startHour);
    const end = new Date(start.getTime() + job.durationHours * 60 * 60 * 1000);
    const created = await prisma.jobPosting.create({
      data: {
        employerId: employerProfiles[job.employerIndex].id,
        title: job.title,
        description: job.description,
        location: job.location,
        lat: job.lat,
        lng: job.lng,
        start,
        end,
        neededRoles: job.neededRoles,
        headcount: job.headcount,
        rate: job.rate,
        status: job.status ?? JobStatus.OPEN,
      },
    });

    jobRecords.push(created);
  }

  const bookingRecords: Booking[] = [];

  for (const job of jobRecords.slice(0, 3)) {
    const matching = workerProfiles.filter((worker) =>
      worker.skills.some((skill) => job.neededRoles.includes(skill))
    );

    const selected: typeof workerProfiles = [...matching];

    while (selected.length < Math.min(2, workerProfiles.length)) {
      const fallback = workerProfiles[randomInt(0, workerProfiles.length - 1)];
      if (!selected.some((worker) => worker.id === fallback.id)) {
        selected.push(fallback);
      }
    }

    const uniqueSelected = selected
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(3, workerProfiles.length));

    for (const [index, worker] of uniqueSelected.entries()) {
      const status = index === 0 ? BookingStatus.ACCEPTED : BookingStatus.OFFERED;
      const booking = await prisma.booking.create({
        data: {
          jobId: job.id,
          workerId: worker.id,
          status,
        },
      });
      bookingRecords.push(booking);
    }
  }

  for (const job of jobRecords.slice(0, 3)) {
    const accepted = bookingRecords.filter(
      (booking) => booking.jobId === job.id && booking.status === BookingStatus.ACCEPTED
    );

    if (!accepted.length) {
      continue;
    }

    await prisma.invoice.create({
      data: {
        employerId: job.employerId,
        jobId: job.id,
        amountCents: job.rate * accepted.length * 5 * 100,
        status: InvoiceStatus.SENT,
        pdfUrl: `https://example.com/invoices/${job.id}.pdf`,
      },
    });

    for (let i = 0; i < accepted.length; i += 1) {
      const booking = accepted[i];
      await prisma.payout.create({
        data: {
          workerId: booking.workerId,
          bookingId: booking.id,
          amountCents: job.rate * 5 * 100,
          status: i === 0 ? PayoutStatus.PAID : PayoutStatus.PENDING,
        },
      });
    }
  }

  console.log("✅ Seed complete");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
