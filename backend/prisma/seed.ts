import { PrismaClient, PolicyType, PolicyStatus, ClaimStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEMO_USERS } from './demoUsers';

const prisma = new PrismaClient();

async function seedUsers() {
  const usersByEmail: Record<string, { id: string; email: string }> = {};

  for (const demoUser of DEMO_USERS) {
    const passwordHash = await bcrypt.hash(demoUser.password, 12);
    const user = await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {
        password: passwordHash,
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        phone: demoUser.phone,
        role: demoUser.role,
        address: demoUser.address,
        city: demoUser.city,
        state: demoUser.state,
        zipCode: demoUser.zipCode,
        isActive: true,
      },
      create: {
        email: demoUser.email,
        password: passwordHash,
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        phone: demoUser.phone,
        role: demoUser.role,
        address: demoUser.address,
        city: demoUser.city,
        state: demoUser.state,
        zipCode: demoUser.zipCode,
      },
    });
    usersByEmail[demoUser.email] = user;
  }

  return usersByEmail;
}

async function seedSampleData(usersByEmail: Record<string, { id: string; email: string }>) {
  const client1 = usersByEmail['john.doe@example.com'];
  const client2 = usersByEmail['jane.smith@example.com'];
  const adjuster = usersByEmail['adjuster@assureme.com'];

  if (!client1 || !client2 || !adjuster) {
    return;
  }

  const autoPolicy = await prisma.policy.upsert({
    where: { policyNumber: 'AUTO-2024-001' },
    update: {},
    create: {
      policyNumber: 'AUTO-2024-001',
      userId: client1.id,
      policyType: PolicyType.AUTO,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      status: PolicyStatus.ACTIVE,
      premiumAmount: 1200.0,
      deductible: 500.0,
      renewalDate: new Date('2024-12-31'),
      coverageDetails: {
        liability: {
          bodilyInjury: '$250,000 per person / $500,000 per accident',
          propertyDamage: '$100,000 per accident',
        },
        comprehensive: '$50,000',
        collision: '$50,000',
      },
      insuredAssets: {
        vehicles: [
          {
            year: 2020,
            make: 'Toyota',
            model: 'Camry',
            vin: '1HGCM82633A123456',
          },
        ],
      },
    },
  });

  const homePolicy = await prisma.policy.upsert({
    where: { policyNumber: 'HOME-2024-001' },
    update: {},
    create: {
      policyNumber: 'HOME-2024-001',
      userId: client2.id,
      policyType: PolicyType.HOME,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      status: PolicyStatus.ACTIVE,
      premiumAmount: 1800.0,
      deductible: 1000.0,
      renewalDate: new Date('2024-12-31'),
      coverageDetails: {
        dwelling: '$400,000',
        personalProperty: '$200,000',
        liability: '$300,000',
        additionalLivingExpenses: '$80,000',
      },
      insuredAssets: {
        properties: [
          {
            address: '456 Oak Avenue',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94102',
            yearBuilt: 1995,
            squareFootage: 2500,
          },
        ],
      },
    },
  });

  const claim1 = await prisma.claim.upsert({
    where: { claimNumber: 'CLM-2024-001' },
    update: {},
    create: {
      claimNumber: 'CLM-2024-001',
      policyId: autoPolicy.id,
      userId: client1.id,
      incidentDate: new Date('2024-01-15'),
      incidentLocation: 'Hollywood Blvd & Vine St, Los Angeles, CA',
      description:
        'Rear-end collision at intersection during morning traffic. Other driver ran red light.',
      status: ClaimStatus.UNDER_REVIEW,
      assignedAdjusterId: adjuster.id,
      involvedParties: {
        create: [
          {
            name: 'Robert Johnson',
            contact: '+1555999888',
            role: 'Other Driver',
          },
          {
            name: 'Mary Wilson',
            contact: '+1555777666',
            role: 'Witness',
          },
        ],
      },
    },
  });

  await prisma.claim.upsert({
    where: { claimNumber: 'CLM-2024-002' },
    update: {},
    create: {
      claimNumber: 'CLM-2024-002',
      policyId: homePolicy.id,
      userId: client2.id,
      incidentDate: new Date('2024-02-01'),
      incidentLocation: '456 Oak Avenue, San Francisco, CA',
      description: 'Water damage from burst pipe in kitchen. Damage to flooring and cabinets.',
      status: ClaimStatus.APPROVED,
      payoutAmount: 15000.0,
      assignedAdjusterId: adjuster.id,
    },
  });

  const existingPayment = await prisma.payment.findFirst({
    where: { transactionId: 'txn_1234567890' },
  });
  if (!existingPayment) {
    await prisma.payment.create({
      data: {
        userId: client1.id,
        policyId: autoPolicy.id,
        amount: 100.0,
        status: PaymentStatus.COMPLETED,
        method: 'Credit Card',
        transactionId: 'txn_1234567890',
        paymentDate: new Date('2024-01-01'),
      },
    });
  }

  const existingPayment2 = await prisma.payment.findFirst({
    where: { transactionId: 'txn_0987654321' },
  });
  if (!existingPayment2) {
    await prisma.payment.create({
      data: {
        userId: client2.id,
        policyId: homePolicy.id,
        amount: 150.0,
        status: PaymentStatus.COMPLETED,
        method: 'Bank Transfer',
        transactionId: 'txn_0987654321',
        paymentDate: new Date('2024-01-01'),
      },
    });
  }

  const existingMessage = await prisma.message.findFirst({
    where: { claimId: claim1.id, senderId: client1.id },
  });
  if (!existingMessage) {
    await prisma.message.create({
      data: {
        senderId: client1.id,
        receiverId: adjuster.id,
        claimId: claim1.id,
        content:
          'Hi, I wanted to check on the status of my claim. Do you need any additional documentation?',
        isRead: false,
      },
    });

    await prisma.message.create({
      data: {
        senderId: adjuster.id,
        receiverId: client1.id,
        claimId: claim1.id,
        content:
          "Hello John, your claim is being processed. We may need photos of the damage. I'll update you within 2 business days.",
        isRead: false,
      },
    });
  }

  const existingChangeRequest = await prisma.policyChangeRequest.findFirst({
    where: { policyId: autoPolicy.id, requestType: 'Add Vehicle' },
  });
  if (!existingChangeRequest) {
    await prisma.policyChangeRequest.create({
      data: {
        policyId: autoPolicy.id,
        userId: client1.id,
        requestType: 'Add Vehicle',
        requestDetails: {
          newVehicle: {
            year: 2023,
            make: 'Honda',
            model: 'Civic',
            vin: '2HGFC2F59NH123456',
          },
        },
        status: 'PENDING',
      },
    });
  }
}

async function main() {
  console.log('🌱 Starting database seeding...');

  const usersByEmail = await seedUsers();
  await seedSampleData(usersByEmail);

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📝 Demo logins (all roles):');
  console.log('─'.repeat(72));
  for (const user of DEMO_USERS) {
    console.log(
      `${user.label.padEnd(22)} ${user.email.padEnd(28)} ${user.password.padEnd(14)} → /${user.portal}`
    );
  }
  console.log('─'.repeat(72));
  console.log('\nNote: There is no separate Sales role. Use Billing Specialist for billing ops.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Database seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
