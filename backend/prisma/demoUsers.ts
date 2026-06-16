import { UserRole } from '@prisma/client';

export interface DemoUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  portal: 'client' | 'admin';
  label: string;
}

/** Seeded demo accounts — one login per application role. */
export const DEMO_USERS: DemoUser[] = [
  {
    email: 'client@assureme.com',
    password: 'client123',
    firstName: 'Demo',
    lastName: 'Client',
    role: UserRole.CLIENT,
    phone: '+1555000001',
    address: '100 Client Lane',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    portal: 'client',
    label: 'Client',
  },
  {
    email: 'john.doe@example.com',
    password: 'client123',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.CLIENT,
    phone: '+1555123456',
    address: '123 Main Street',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    portal: 'client',
    label: 'Client (John)',
  },
  {
    email: 'jane.smith@example.com',
    password: 'client123',
    firstName: 'Jane',
    lastName: 'Smith',
    role: UserRole.CLIENT,
    phone: '+1555654321',
    address: '456 Oak Avenue',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    portal: 'client',
    label: 'Client (Jane)',
  },
  {
    email: 'manager@assureme.com',
    password: 'admin123',
    firstName: 'Operations',
    lastName: 'Manager',
    role: UserRole.ADMIN,
    phone: '+1555000002',
    address: '200 Admin Plaza',
    city: 'Admin City',
    state: 'CA',
    zipCode: '90210',
    portal: 'admin',
    label: 'Admin',
  },
  {
    email: 'admin@assureme.com',
    password: 'admin123',
    firstName: 'Super',
    lastName: 'Admin',
    role: UserRole.SUPER_ADMIN,
    phone: '+1234567890',
    address: '123 Admin Street',
    city: 'Admin City',
    state: 'CA',
    zipCode: '90210',
    portal: 'admin',
    label: 'Super Admin',
  },
  {
    email: 'adjuster@assureme.com',
    password: 'adjuster123',
    firstName: 'Claims',
    lastName: 'Adjuster',
    role: UserRole.CLAIMS_ADJUSTER,
    phone: '+1234567891',
    address: '456 Adjuster Ave',
    city: 'Claims City',
    state: 'CA',
    zipCode: '90211',
    portal: 'admin',
    label: 'Claims Adjuster',
  },
  {
    email: 'billing@assureme.com',
    password: 'billing123',
    firstName: 'Billing',
    lastName: 'Specialist',
    role: UserRole.BILLING_SPECIALIST,
    phone: '+1555000003',
    address: '300 Billing Blvd',
    city: 'Finance City',
    state: 'CA',
    zipCode: '90212',
    portal: 'admin',
    label: 'Billing Specialist',
  },
];
