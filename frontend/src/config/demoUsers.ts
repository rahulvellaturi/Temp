export interface DemoUserCredential {
  label: string;
  email: string;
  password: string;
  portal: 'client' | 'admin';
  role: string;
}

/** Demo logins seeded in the database (see backend/prisma/seed.ts). */
export const DEMO_USER_CREDENTIALS: DemoUserCredential[] = [
  {
    label: 'Client',
    email: 'client@assureme.com',
    password: 'client123',
    portal: 'client',
    role: 'CLIENT',
  },
  {
    label: 'Client (John)',
    email: 'john.doe@example.com',
    password: 'client123',
    portal: 'client',
    role: 'CLIENT',
  },
  {
    label: 'Admin',
    email: 'manager@assureme.com',
    password: 'admin123',
    portal: 'admin',
    role: 'ADMIN',
  },
  {
    label: 'Super Admin',
    email: 'admin@assureme.com',
    password: 'admin123',
    portal: 'admin',
    role: 'SUPER_ADMIN',
  },
  {
    label: 'Claims Adjuster',
    email: 'adjuster@assureme.com',
    password: 'adjuster123',
    portal: 'admin',
    role: 'CLAIMS_ADJUSTER',
  },
  {
    label: 'Billing Specialist',
    email: 'billing@assureme.com',
    password: 'billing123',
    portal: 'admin',
    role: 'BILLING_SPECIALIST',
  },
];
