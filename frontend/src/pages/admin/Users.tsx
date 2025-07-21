import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/useAppDispatch';
import { useApi } from '@/hooks/useApi';
import { useGenericForm } from '@/hooks/useGenericForm';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import { FormField, FormInput } from '@/components/common/Form';
import mockDataService from '@/services/mockDataService';
import { 
  Users as UsersIcon, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Download,
  Upload,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { userSchemas } from '@/lib/validations';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'CLIENT' | 'AGENT' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  dateJoined: string;
  lastLogin?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  policiesCount: number;
  claimsCount: number;
  totalPremiums: number;
  avatar?: string;
}

interface NewUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'CLIENT' | 'AGENT' | 'ADMIN';
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  sendWelcomeEmail: boolean;
}

const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [loading, setLoading] = useState(true);

  const { execute: fetchUsers } = useApi();

  const newUserForm = useGenericForm({
    schema: userSchemas.updateProfile,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
    showSuccessMessage: true,
    successMessage: 'User created successfully!',
  });

  const editUserForm = useGenericForm({
    schema: userSchemas.updateProfile,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
    showSuccessMessage: true,
    successMessage: 'User updated successfully!',
  });

  const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Load users from mock data service
      const allUsers = mockDataService.getUsers();
      
      // Mock users data
      const mockUsers = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@email.com',
          phone: '(555) 123-4567',
          role: 'CLIENT',
          status: 'ACTIVE',
          dateJoined: '2023-06-15',
          lastLogin: '2024-01-20T09:30:00Z',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          policiesCount: 3,
          claimsCount: 1,
          totalPremiums: 3600,
        },
        {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@email.com',
          phone: '(555) 987-6543',
          role: 'CLIENT',
          status: 'ACTIVE',
          dateJoined: '2023-08-22',
          lastLogin: '2024-01-19T14:15:00Z',
          address: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          policiesCount: 2,
          claimsCount: 0,
          totalPremiums: 2400,
        },
        {
          id: '3',
          firstName: 'Michael',
          lastName: 'Chen',
          email: 'michael.chen@assureme.com',
          phone: '(555) 456-7890',
          role: 'AGENT',
          status: 'ACTIVE',
          dateJoined: '2022-03-10',
          lastLogin: '2024-01-20T08:45:00Z',
          address: '789 Pine Rd',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          policiesCount: 0,
          claimsCount: 0,
          totalPremiums: 0,
        },
        {
          id: '4',
          firstName: 'Emily',
          lastName: 'Davis',
          email: 'emily.davis@email.com',
          phone: '(555) 321-0987',
          role: 'CLIENT',
          status: 'INACTIVE',
          dateJoined: '2023-12-05',
          lastLogin: '2023-12-20T16:30:00Z',
          address: '321 Elm St',
          city: 'Miami',
          state: 'FL',
          zipCode: '33101',
          policiesCount: 1,
          claimsCount: 2,
          totalPremiums: 1200,
        },
        {
          id: '5',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@assureme.com',
          phone: '(555) 000-0000',
          role: 'ADMIN',
          status: 'ACTIVE',
          dateJoined: '2022-01-01',
          lastLogin: '2024-01-20T10:00:00Z',
          address: '100 Corporate Blvd',
          city: 'Boston',
          state: 'MA',
          zipCode: '02101',
          policiesCount: 0,
          claimsCount: 0,
          totalPremiums: 0,
        },
        {
          id: '6',
          firstName: 'Robert',
          lastName: 'Wilson',
          email: 'robert.wilson@email.com',
          phone: '(555) 654-3210',
          role: 'CLIENT',
          status: 'SUSPENDED',
          dateJoined: '2023-04-18',
          lastLogin: '2024-01-10T12:00:00Z',
          address: '567 Maple Dr',
          city: 'Seattle',
          state: 'WA',
          zipCode: '98101',
          policiesCount: 2,
          claimsCount: 3,
          totalPremiums: 2800,
        },
      ];
      
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'success',
      INACTIVE: 'warning',
      SUSPENDED: 'error'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getRoleColor = (role: string) => {
    const colors = {
      CLIENT: 'default',
      AGENT: 'info',
      ADMIN: 'error'
    };
    return colors[role as keyof typeof colors] || 'default';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    editUserForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      zipCode: user.zipCode || '',
    });
    setShowEditUser(true);
  };

  const handleCreateUser = async (data: any) => {
    try {
      console.log('Creating user:', data);
      setShowCreateUser(false);
      await loadUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleUpdateUser = async (data: any) => {
    try {
      console.log('Updating user:', selectedUser?.id, data);
      setShowEditUser(false);
      await loadUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      console.log('Changing user status:', userId, newStatus);
      await loadUsers();
    } catch (error) {
      console.error('Failed to change user status:', error);
    }
  };

  const UserDetailsModal = () => {
    if (!selectedUser) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <UsersIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <StatusBadge 
                      status={selectedUser.role} 
                      variant={getRoleColor(selectedUser.role) as any}
                    />
                    <StatusBadge 
                      status={selectedUser.status} 
                      variant={getStatusColor(selectedUser.status) as any}
                    />
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm">{selectedUser.email}</span>
                </div>
                {selectedUser.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm">{selectedUser.phone}</span>
                  </div>
                )}
                {selectedUser.address && (
                  <div className="flex items-center space-x-3 md:col-span-2">
                    <MapPin className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm">
                      {selectedUser.address}, {selectedUser.city}, {selectedUser.state} {selectedUser.zipCode}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600">Date Joined</p>
                  <p className="font-medium">{formatDate(selectedUser.dateJoined)}</p>
                </div>
                {selectedUser.lastLogin && (
                  <div>
                    <p className="text-sm text-neutral-600">Last Login</p>
                    <p className="font-medium">{formatDateTime(selectedUser.lastLogin)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics (for clients) */}
            {selectedUser.role === 'CLIENT' && (
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-4">Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-neutral-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-neutral-900">{selectedUser.policiesCount}</p>
                    <p className="text-sm text-neutral-600">Policies</p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-neutral-900">{selectedUser.claimsCount}</p>
                    <p className="text-sm text-neutral-600">Claims</p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-neutral-900">{formatCurrency(selectedUser.totalPremiums)}</p>
                    <p className="text-sm text-neutral-600">Total Premiums</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handleEditUser(selectedUser)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </Button>
              {selectedUser.status === 'ACTIVE' ? (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange(selectedUser.id, 'SUSPENDED')}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Suspend
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange(selectedUser.id, 'ACTIVE')}
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Activate
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CreateUserModal = () => {
    const { register, handleSubmit, formState: { errors } } = newUserForm;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">Create New User</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateUser(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleCreateUser)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="First Name"
                error={errors.firstName?.message}
                required
              >
                <FormInput
                  {...register('firstName')}
                  error={!!errors.firstName}
                />
              </FormField>

              <FormField
                label="Last Name"
                error={errors.lastName?.message}
                required
              >
                <FormInput
                  {...register('lastName')}
                  error={!!errors.lastName}
                />
              </FormField>

              <FormField
                label="Email Address"
                error={errors.email?.message}
                required
              >
                <FormInput
                  {...register('email')}
                  type="email"
                  error={!!errors.email}
                />
              </FormField>

              <FormField
                label="Phone Number"
                error={errors.phone?.message}
              >
                <FormInput
                  {...register('phone')}
                  type="tel"
                  error={!!errors.phone}
                />
              </FormField>

              <FormField
                label="Role"
                required
              >
                <select className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                  <option value="CLIENT">Client</option>
                  <option value="AGENT">Agent</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </FormField>

              <div></div>

              <FormField
                label="Address"
                error={errors.address?.message}
                className="md:col-span-2"
              >
                <FormInput
                  {...register('address')}
                  error={!!errors.address}
                />
              </FormField>

              <FormField
                label="City"
                error={errors.city?.message}
              >
                <FormInput
                  {...register('city')}
                  error={!!errors.city}
                />
              </FormField>

              <FormField
                label="State"
                error={errors.state?.message}
              >
                <select
                  {...register('state')}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select State</option>
                  {US_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="ZIP Code"
                error={errors.zipCode?.message}
              >
                <FormInput
                  {...register('zipCode')}
                  error={!!errors.zipCode}
                />
              </FormField>
            </div>

            <div className="flex items-center">
              <input
                id="sendWelcome"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                defaultChecked
              />
              <label htmlFor="sendWelcome" className="ml-3 block text-sm text-neutral-900">
                Send welcome email with login instructions
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateUser(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Create User
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const EditUserModal = () => {
    if (!selectedUser) return null;
    const { register, handleSubmit, formState: { errors } } = editUserForm;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">
                Edit User: {selectedUser.firstName} {selectedUser.lastName}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditUser(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleUpdateUser)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="First Name"
                error={errors.firstName?.message}
                required
              >
                <FormInput
                  {...register('firstName')}
                  error={!!errors.firstName}
                />
              </FormField>

              <FormField
                label="Last Name"
                error={errors.lastName?.message}
                required
              >
                <FormInput
                  {...register('lastName')}
                  error={!!errors.lastName}
                />
              </FormField>

              <FormField
                label="Email Address"
                error={errors.email?.message}
                required
              >
                <FormInput
                  {...register('email')}
                  type="email"
                  error={!!errors.email}
                />
              </FormField>

              <FormField
                label="Phone Number"
                error={errors.phone?.message}
              >
                <FormInput
                  {...register('phone')}
                  type="tel"
                  error={!!errors.phone}
                />
              </FormField>

              <FormField
                label="Address"
                error={errors.address?.message}
                className="md:col-span-2"
              >
                <FormInput
                  {...register('address')}
                  error={!!errors.address}
                />
              </FormField>

              <FormField
                label="City"
                error={errors.city?.message}
              >
                <FormInput
                  {...register('city')}
                  error={!!errors.city}
                />
              </FormField>

              <FormField
                label="State"
                error={errors.state?.message}
              >
                <select
                  {...register('state')}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select State</option>
                  {US_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="ZIP Code"
                error={errors.zipCode?.message}
              >
                <FormInput
                  {...register('zipCode')}
                  error={!!errors.zipCode}
                />
              </FormField>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditUser(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Update User
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-neutral-200 rounded w-48"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-neutral-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage client accounts, agents, and administrators"
        actions={
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Users
            </Button>
            <Button onClick={() => setShowCreateUser(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Users</p>
              <p className="text-2xl font-bold text-neutral-900">{users.length}</p>
            </div>
            <UsersIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Active Users</p>
              <p className="text-2xl font-bold text-neutral-900">
                {users.filter(u => u.status === 'ACTIVE').length}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Clients</p>
              <p className="text-2xl font-bold text-neutral-900">
                {users.filter(u => u.role === 'CLIENT').length}
              </p>
            </div>
            <UsersIcon className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Agents</p>
              <p className="text-2xl font-bold text-neutral-900">
                {users.filter(u => u.role === 'AGENT').length}
              </p>
            </div>
            <Shield className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField label="Search Users">
            <FormInput
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              clearable
              onClear={() => setSearchTerm('')}
            />
          </FormField>

          <FormField label="Role">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="ALL">All Roles</option>
              <option value="CLIENT">Clients</option>
              <option value="AGENT">Agents</option>
              <option value="ADMIN">Admins</option>
            </select>
          </FormField>

          <FormField label="Status">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </FormField>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-medium text-neutral-900">User</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Contact</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Role</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Joined</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Last Login</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {user.firstName[0]}{user.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">
                          {user.firstName} {user.lastName}
                        </p>
                        {user.role === 'CLIENT' && (
                          <p className="text-sm text-neutral-600">
                            {user.policiesCount} policies • {formatCurrency(user.totalPremiums)}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm text-neutral-900">{user.email}</p>
                      {user.phone && (
                        <p className="text-sm text-neutral-600">{user.phone}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge 
                      status={user.role} 
                      variant={getRoleColor(user.role) as any}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge 
                      status={user.status} 
                      variant={getStatusColor(user.status) as any}
                    />
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-600">
                    {formatDate(user.dateJoined)}
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-600">
                    {user.lastLogin ? formatDateTime(user.lastLogin) : 'Never'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No users found</h3>
            <p className="text-neutral-600 mb-6">
              {searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Try adjusting your filters to see more users.'
                : 'Start by adding your first user to the system.'
              }
            </p>
            <Button onClick={() => setShowCreateUser(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First User
            </Button>
          </div>
        )}
      </Card>

      {/* Modals */}
      {showDetails && <UserDetailsModal />}
      {showCreateUser && <CreateUserModal />}
      {showEditUser && <EditUserModal />}
    </div>
  );
};

export default AdminUsers;