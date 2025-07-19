import { PrismaClient, UserRole, PolicyType, PolicyStatus, ClaimStatus, DocumentType, PaymentStatus, MfaMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@assureme.com' },
    update: {},
    create: {
      email: 'admin@assureme.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890',
      role: UserRole.SUPER_ADMIN,
      address: '123 Admin Street',
      city: 'Admin City',
      state: 'CA',
      zipCode: '90210',
    },
  });

  // Create claims adjuster
  const adjusterPassword = await bcrypt.hash('adjuster123', 12);
  const adjuster = await prisma.user.upsert({
    where: { email: 'adjuster@assureme.com' },
    update: {},
    create: {
      email: 'adjuster@assureme.com',
      password: adjusterPassword,
      firstName: 'Claims',
      lastName: 'Adjuster',
      phone: '+1234567891',
      role: UserRole.CLAIMS_ADJUSTER,
      address: '456 Adjuster Ave',
      city: 'Claims City',
      state: 'CA',
      zipCode: '90211',
    },
  });

  // Create sample client users
  const clientPassword = await bcrypt.hash('client123', 12);
  
  const client1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      password: clientPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1555123456',
      role: UserRole.CLIENT,
      address: '123 Main Street',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
    },
  });

  const client2 = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      email: 'jane.smith@example.com',
      password: clientPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1555654321',
      role: UserRole.CLIENT,
      address: '456 Oak Avenue',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
    },
  });

  // Create sample policies
  const autoPolicy = await prisma.policy.create({
    data: {
      policyNumber: 'AUTO-2024-001',
      userId: client1.id,
      policyType: PolicyType.AUTO,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      status: PolicyStatus.ACTIVE,
      premiumAmount: 1200.00,
      deductible: 500.00,
      renewalDate: new Date('2024-12-31'),
      coverageDetails: {
        liability: {
          bodilyInjury: '$250,000 per person / $500,000 per accident',
          propertyDamage: '$100,000 per accident'
        },
        comprehensive: '$50,000',
        collision: '$50,000'
      },
      insuredAssets: {
        vehicles: [
          {
            year: 2020,
            make: 'Toyota',
            model: 'Camry',
            vin: '1HGCM82633A123456'
          }
        ]
      }
    },
  });

  const homePolicy = await prisma.policy.create({
    data: {
      policyNumber: 'HOME-2024-001',
      userId: client2.id,
      policyType: PolicyType.HOME,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      status: PolicyStatus.ACTIVE,
      premiumAmount: 1800.00,
      deductible: 1000.00,
      renewalDate: new Date('2024-12-31'),
      coverageDetails: {
        dwelling: '$400,000',
        personalProperty: '$200,000',
        liability: '$300,000',
        additionalLivingExpenses: '$80,000'
      },
      insuredAssets: {
        properties: [
          {
            address: '456 Oak Avenue',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94102',
            yearBuilt: 1995,
            squareFootage: 2500
          }
        ]
      }
    },
  });

  // Create sample claims
  const claim1 = await prisma.claim.create({
    data: {
      claimNumber: 'CLM-2024-001',
      policyId: autoPolicy.id,
      userId: client1.id,
      incidentDate: new Date('2024-01-15'),
      incidentLocation: 'Hollywood Blvd & Vine St, Los Angeles, CA',
      description: 'Rear-end collision at intersection during morning traffic. Other driver ran red light.',
      status: ClaimStatus.UNDER_REVIEW,
      assignedAdjusterId: adjuster.id,
      involvedParties: {
        create: [
          {
            name: 'Robert Johnson',
            contact: '+1555999888',
            role: 'Other Driver'
          },
          {
            name: 'Mary Wilson',
            contact: '+1555777666',
            role: 'Witness'
          }
        ]
      }
    },
  });

  const claim2 = await prisma.claim.create({
    data: {
      claimNumber: 'CLM-2024-002',
      policyId: homePolicy.id,
      userId: client2.id,
      incidentDate: new Date('2024-02-01'),
      incidentLocation: '456 Oak Avenue, San Francisco, CA',
      description: 'Water damage from burst pipe in kitchen. Damage to flooring and cabinets.',
      status: ClaimStatus.APPROVED,
      payoutAmount: 15000.00,
      assignedAdjusterId: adjuster.id,
    },
  });

  // Create sample payments
  await prisma.payment.create({
    data: {
      userId: client1.id,
      policyId: autoPolicy.id,
      amount: 100.00,
      status: PaymentStatus.COMPLETED,
      method: 'Credit Card',
      transactionId: 'txn_1234567890',
      paymentDate: new Date('2024-01-01'),
    },
  });

  await prisma.payment.create({
    data: {
      userId: client2.id,
      policyId: homePolicy.id,
      amount: 150.00,
      status: PaymentStatus.COMPLETED,
      method: 'Bank Transfer',
      transactionId: 'txn_0987654321',
      paymentDate: new Date('2024-01-01'),
    },
  });

  // Create billing statements
  await prisma.billingStatement.create({
    data: {
      userId: client1.id,
      policyId: autoPolicy.id,
      statementDate: new Date('2024-01-01'),
      dueDate: new Date('2024-02-01'),
      amountDue: 100.00,
      isPaid: true,
    },
  });

  await prisma.billingStatement.create({
    data: {
      userId: client2.id,
      policyId: homePolicy.id,
      statementDate: new Date('2024-01-01'),
      dueDate: new Date('2024-02-01'),
      amountDue: 150.00,
      isPaid: false,
    },
  });

  // Create sample messages
  await prisma.message.create({
    data: {
      senderId: client1.id,
      receiverId: adjuster.id,
      claimId: claim1.id,
      content: 'Hi, I wanted to check on the status of my claim. Do you need any additional documentation?',
      isRead: false,
    },
  });

  await prisma.message.create({
    data: {
      senderId: adjuster.id,
      receiverId: client1.id,
      claimId: claim1.id,
      content: 'Hello John, your claim is being processed. We may need photos of the damage. I\'ll update you within 2 business days.',
      isRead: false,
    },
  });

  // Create policy change request
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
          vin: '2HGFC2F59NH123456'
        }
      },
      status: 'PENDING',
    },
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📝 Sample Users Created:');
  console.log('Admin: admin@assureme.com / admin123');
  console.log('Claims Adjuster: adjuster@assureme.com / adjuster123');
  console.log('Client 1: john.doe@example.com / client123');
  console.log('Client 2: jane.smith@example.com / client123');
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