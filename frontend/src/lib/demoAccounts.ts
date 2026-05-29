export interface DemoAccount {
  label: string;
  email: string;
  password: string;
  role: string;
  portal: 'client' | 'admin';
}

/** Seeded credentials — must match backend/prisma/seed.ts */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: 'Super Admin',
    email: 'admin@assureme.com',
    password: 'admin123',
    role: 'SUPER_ADMIN',
    portal: 'admin',
  },
  {
    label: 'Claims Adjuster',
    email: 'adjuster@assureme.com',
    password: 'adjuster123',
    role: 'CLAIMS_ADJUSTER',
    portal: 'admin',
  },
  {
    label: 'Billing Specialist',
    email: 'billing@assureme.com',
    password: 'billing123',
    role: 'BILLING_SPECIALIST',
    portal: 'admin',
  },
  {
    label: 'Client (John Doe)',
    email: 'john.doe@example.com',
    password: 'client123',
    role: 'CLIENT',
    portal: 'client',
  },
  {
    label: 'Client (Jane Smith)',
    email: 'jane.smith@example.com',
    password: 'client123',
    role: 'CLIENT',
    portal: 'client',
  },
];
