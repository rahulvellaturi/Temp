import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useAppDispatch';
import { updateProfile, changePassword, enableMFA, disableMFA } from '@/store/slices/authSlice';
import { useGenericForm } from '@/hooks/useGenericForm';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { FormField, FormInput } from '@/components/common/Form';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  Bell,
  CreditCard,
  Download,
  Upload,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { authSchemas, userSchemas } from '@/lib/validations';

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  policyUpdates: boolean;
  paymentReminders: boolean;
  claimUpdates: boolean;
  marketingEmails: boolean;
}

interface SecuritySettings {
  mfaEnabled: boolean;
  loginAlerts: boolean;
  sessionTimeout: number;
  passwordLastChanged: string;
}

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    policyUpdates: true,
    paymentReminders: true,
    claimUpdates: true,
    marketingEmails: false,
  });
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    mfaEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30,
    passwordLastChanged: '2024-01-01',
  });

  const profileForm = useGenericForm({
    schema: userSchemas.updateProfile,
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      zipCode: user?.zipCode || '',
    },
    showSuccessMessage: true,
    successMessage: 'Profile updated successfully!',
  });

  const passwordForm = useGenericForm({
    schema: authSchemas.changePassword,
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    showSuccessMessage: true,
    successMessage: 'Password changed successfully!',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: <User className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'preferences', label: 'Preferences', icon: <User className="h-4 w-4" /> },
  ];

  const handleUpdateProfile = async (data: any) => {
    try {
      await dispatch(updateProfile(data)).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleChangePassword = async (data: any) => {
    try {
      await dispatch(changePassword(data)).unwrap();
      setShowChangePassword(false);
      passwordForm.reset();
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const handleToggleMFA = async () => {
    try {
      if (securitySettings.mfaEnabled) {
        await dispatch(disableMFA()).unwrap();
        setSecuritySettings(prev => ({ ...prev, mfaEnabled: false }));
      } else {
        setShowMFASetup(true);
      }
    } catch (error) {
      console.error('Failed to toggle MFA:', error);
    }
  };

  const handleMFASetup = async () => {
    try {
      await dispatch(enableMFA()).unwrap();
      setSecuritySettings(prev => ({ ...prev, mfaEnabled: true }));
      setShowMFASetup(false);
    } catch (error) {
      console.error('Failed to enable MFA:', error);
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const ChangePasswordModal = () => {
    const { register, handleSubmit, formState: { errors }, watch } = passwordForm;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">Change Password</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChangePassword(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleChangePassword)} className="p-6 space-y-4">
            <FormField
              label="Current Password"
              error={errors.currentPassword?.message}
              required
            >
              <div className="relative">
                <FormInput
                  {...register('currentPassword')}
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  error={!!errors.currentPassword}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>

            <FormField
              label="New Password"
              error={errors.newPassword?.message}
              required
            >
              <div className="relative">
                <FormInput
                  {...register('newPassword')}
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  error={!!errors.newPassword}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>

            <FormField
              label="Confirm New Password"
              error={errors.confirmPassword?.message}
              required
            >
              <div className="relative">
                <FormInput
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  error={!!errors.confirmPassword}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowChangePassword(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isLoading}>
                Change Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const MFASetupModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">Setup Two-Factor Authentication</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMFASetup(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="text-center">
              <div className="w-32 h-32 bg-neutral-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-neutral-500">QR Code</span>
              </div>
              <p className="text-sm text-neutral-600 mb-4">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-lg">
              <p className="text-sm text-neutral-600 mb-2">Manual entry code:</p>
              <code className="text-sm font-mono bg-white p-2 rounded border block">
                ABCD EFGH IJKL MNOP QRST UVWX YZ12 3456
              </code>
            </div>

            <FormField label="Verification Code" required>
              <FormInput
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </FormField>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowMFASetup(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleMFASetup} loading={isLoading}>
                Enable MFA
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile Settings"
        description="Manage your account information and preferences"
      />

      {/* Navigation Tabs */}
      <Card className="p-6">
        <div className="flex space-x-1 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`view-toggle-button ${
                activeTab === tab.id
                  ? 'view-toggle-button-active'
                  : 'view-toggle-button-inactive'
              } flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Personal Information</h3>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>

          <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Avatar Section */}
              <div className="md:col-span-2 flex items-center space-x-6">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900">Profile Photo</h4>
                  <p className="text-sm text-neutral-600 mb-3">
                    Upload a profile photo to personalize your account
                  </p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                    <Button variant="outline" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <FormField
                label="First Name"
                error={profileForm.formState.errors.firstName?.message}
                required
              >
                <FormInput
                  {...profileForm.register('firstName')}
                  disabled={!isEditing}
                  error={!!profileForm.formState.errors.firstName}
                />
              </FormField>

              <FormField
                label="Last Name"
                error={profileForm.formState.errors.lastName?.message}
                required
              >
                <FormInput
                  {...profileForm.register('lastName')}
                  disabled={!isEditing}
                  error={!!profileForm.formState.errors.lastName}
                />
              </FormField>

              <FormField
                label="Email Address"
                error={profileForm.formState.errors.email?.message}
                required
              >
                <FormInput
                  {...profileForm.register('email')}
                  type="email"
                  disabled={!isEditing}
                  error={!!profileForm.formState.errors.email}
                  leftIcon={<Mail className="h-4 w-4" />}
                />
              </FormField>

              <FormField
                label="Phone Number"
                error={profileForm.formState.errors.phone?.message}
              >
                <FormInput
                  {...profileForm.register('phone')}
                  type="tel"
                  disabled={!isEditing}
                  error={!!profileForm.formState.errors.phone}
                  leftIcon={<Phone className="h-4 w-4" />}
                />
              </FormField>

              <FormField
                label="Date of Birth"
                error={profileForm.formState.errors.dateOfBirth?.message}
              >
                <FormInput
                  {...profileForm.register('dateOfBirth')}
                  type="date"
                  disabled={!isEditing}
                  error={!!profileForm.formState.errors.dateOfBirth}
                  leftIcon={<Calendar className="h-4 w-4" />}
                />
              </FormField>

              <div></div> {/* Empty cell for spacing */}

              {/* Address Information */}
              <div className="md:col-span-2">
                <h4 className="font-medium text-neutral-900 mb-4 pb-2 border-b">Address Information</h4>
              </div>

              <FormField
                label="Street Address"
                error={profileForm.formState.errors.address?.message}
                className="md:col-span-2"
              >
                <FormInput
                  {...profileForm.register('address')}
                  disabled={!isEditing}
                  error={!!profileForm.formState.errors.address}
                  leftIcon={<MapPin className="h-4 w-4" />}
                />
              </FormField>

              <FormField
                label="City"
                error={profileForm.formState.errors.city?.message}
              >
                <FormInput
                  {...profileForm.register('city')}
                  disabled={!isEditing}
                  error={!!profileForm.formState.errors.city}
                />
              </FormField>

              <FormField
                label="State"
                error={profileForm.formState.errors.state?.message}
              >
                <select
                  {...profileForm.register('state')}
                  disabled={!isEditing}
                  className={`form-select-base ${
                    !isEditing ? 'form-input-disabled' : 'form-select-default'
                  } ${
                    profileForm.formState.errors.state ? 'form-select-error' : ''
                  }`}
                >
                  <option value="">Select State</option>
                  {US_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="ZIP Code"
                error={profileForm.formState.errors.zipCode?.message}
              >
                <FormInput
                  {...profileForm.register('zipCode')}
                  disabled={!isEditing}
                  error={!!profileForm.formState.errors.zipCode}
                />
              </FormField>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-6">Password & Authentication</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Lock className="h-5 w-5 text-neutral-500" />
                  <div>
                    <h4 className="font-medium text-neutral-900">Password</h4>
                    <p className="text-sm text-neutral-600">
                      Last changed on {formatDate(securitySettings.passwordLastChanged)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowChangePassword(true)}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-neutral-500" />
                  <div>
                    <h4 className="font-medium text-neutral-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-neutral-600">
                      {securitySettings.mfaEnabled 
                        ? 'Add an extra layer of security to your account'
                        : 'Secure your account with two-factor authentication'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {securitySettings.mfaEnabled && (
                    <span className="text-sm text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Enabled
                    </span>
                  )}
                  <Button
                    variant={securitySettings.mfaEnabled ? "outline" : "default"}
                    onClick={handleToggleMFA}
                  >
                    {securitySettings.mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-6">Security Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-neutral-900">Login Alerts</h4>
                  <p className="text-sm text-neutral-600">
                    Get notified when someone logs into your account
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitySettings.loginAlerts}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      loginAlerts: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-neutral-900">Session Timeout</h4>
                  <p className="text-sm text-neutral-600">
                    Automatically log out after period of inactivity
                  </p>
                </div>
                <select
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings(prev => ({
                    ...prev,
                    sessionTimeout: parseInt(e.target.value)
                  }))}
                  className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={0}>Never</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-6">Account Actions</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-neutral-900">Download Account Data</h4>
                  <p className="text-sm text-neutral-600">
                    Export all your account data and information
                  </p>
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Data
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h4 className="font-medium text-red-900">Delete Account</h4>
                  <p className="text-sm text-red-700">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6">Notification Preferences</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-neutral-900 mb-4">Communication Preferences</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-neutral-900">Email Notifications</h5>
                    <p className="text-sm text-neutral-600">
                      Receive notifications via email
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={() => handleNotificationChange('emailNotifications')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-neutral-900">SMS Notifications</h5>
                    <p className="text-sm text-neutral-600">
                      Receive notifications via text message
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.smsNotifications}
                      onChange={() => handleNotificationChange('smsNotifications')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-neutral-900 mb-4">Notification Types</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-neutral-900">Policy Updates</h5>
                    <p className="text-sm text-neutral-600">
                      Changes to your insurance policies
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.policyUpdates}
                      onChange={() => handleNotificationChange('policyUpdates')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-neutral-900">Payment Reminders</h5>
                    <p className="text-sm text-neutral-600">
                      Reminders for upcoming premium payments
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.paymentReminders}
                      onChange={() => handleNotificationChange('paymentReminders')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-neutral-900">Claim Updates</h5>
                    <p className="text-sm text-neutral-600">
                      Status updates on your insurance claims
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.claimUpdates}
                      onChange={() => handleNotificationChange('claimUpdates')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-neutral-900">Marketing Emails</h5>
                    <p className="text-sm text-neutral-600">
                      Product updates and promotional offers
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.marketingEmails}
                      onChange={() => handleNotificationChange('marketingEmails')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6">Account Preferences</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-neutral-900 mb-4">Display Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-neutral-900">Language</h5>
                    <p className="text-sm text-neutral-600">
                      Choose your preferred language
                    </p>
                  </div>
                  <select className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-neutral-900">Time Zone</h5>
                    <p className="text-sm text-neutral-600">
                      Set your local time zone
                    </p>
                  </div>
                  <select className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                    <option>Eastern Time (ET)</option>
                    <option>Central Time (CT)</option>
                    <option>Mountain Time (MT)</option>
                    <option>Pacific Time (PT)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-neutral-900 mb-4">Privacy Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-neutral-900">Profile Visibility</h5>
                    <p className="text-sm text-neutral-600">
                      Control who can see your profile information
                    </p>
                  </div>
                  <select className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                    <option>Private</option>
                    <option>Agents Only</option>
                    <option>Public</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Modals */}
      {showChangePassword && <ChangePasswordModal />}
      {showMFASetup && <MFASetupModal />}
    </div>
  );
};

export default Profile;