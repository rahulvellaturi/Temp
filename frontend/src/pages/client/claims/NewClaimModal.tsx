import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormModal } from '@/components/common/Modal';
import { FormField, FormInput } from '@/components/common/Form';
import { MapPin } from 'lucide-react';
import { getAvailablePolicies, getClaimTypes } from '@/services/staticDataService';

interface NewClaimFormValues {
  policyId: string;
  type: string;
  incidentDate: string;
  location: string;
  description: string;
  estimatedAmount: number;
  policeReportNumber?: string;
  witnesses?: string;
}

interface NewClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: UseFormReturn<NewClaimFormValues>;
  isLoading?: boolean;
}

const availablePolicies = getAvailablePolicies();
const claimTypes = getClaimTypes();

const NewClaimModal: React.FC<NewClaimModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  isLoading = false,
}) => {
  const {
    register,
    formState: { errors },
    watch,
  } = form;

  const watchPolicyId = watch('policyId');
  const selectedPolicy = availablePolicies.find((p) => p.id === watchPolicyId);

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="File New Claim"
      onSubmit={onSubmit}
      submitText="Submit Claim"
      isLoading={isLoading}
      size="lg"
      backdrop="none"
    >
      <FormField label="Select Policy" error={errors.policyId?.message} required>
        <select
          {...register('policyId')}
          className={`claims-form-select ${
            errors.policyId ? 'claims-form-select-error' : 'claims-form-select-default'
          }`}
        >
          <option value="">Choose a policy...</option>
          {availablePolicies.map((policy) => (
            <option key={policy.id} value={policy.id}>
              {policy.number} - {policy.description}
            </option>
          ))}
        </select>
      </FormField>

      {selectedPolicy && (
        <FormField label="Claim Type" error={errors.type?.message} required>
          <select
            {...register('type')}
            className={`claims-form-select ${
              errors.type ? 'claims-form-select-error' : 'claims-form-select-default'
            }`}
          >
            <option value="">Select claim type...</option>
            {claimTypes[selectedPolicy.type as keyof typeof claimTypes]?.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FormField>
      )}

      <FormField label="Date of Incident" error={errors.incidentDate?.message} required>
        <FormInput
          {...register('incidentDate')}
          type="date"
          error={!!errors.incidentDate}
          max={new Date().toISOString().split('T')[0]}
        />
      </FormField>

      <FormField label="Location of Incident" error={errors.location?.message}>
        <FormInput
          {...register('location')}
          placeholder="Enter the location where the incident occurred"
          error={!!errors.location}
          leftIcon={<MapPin className="h-4 w-4" />}
        />
      </FormField>

      <FormField
        label="Description"
        error={errors.description?.message}
        required
        description="Provide a detailed description of what happened"
      >
        <textarea
          {...register('description')}
          rows={4}
          className={`claims-form-textarea ${
            errors.description ? 'claims-form-textarea-error' : 'claims-form-textarea-default'
          }`}
          placeholder="Describe the incident in detail..."
        />
      </FormField>

      <FormField
        label="Estimated Damage Amount"
        error={errors.estimatedAmount?.message}
        description="Approximate cost of damages (if known)"
      >
        <FormInput
          {...register('estimatedAmount', { valueAsNumber: true })}
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          error={!!errors.estimatedAmount}
        />
      </FormField>

      {selectedPolicy?.type === 'AUTO' && (
        <>
          <FormField
            label="Police Report Number"
            error={errors.policeReportNumber?.message}
            description="If applicable"
          >
            <FormInput
              {...register('policeReportNumber')}
              placeholder="Enter police report number"
              error={!!errors.policeReportNumber}
            />
          </FormField>

          <FormField
            label="Witnesses"
            error={errors.witnesses?.message}
            description="Names and contact information of any witnesses"
          >
            <textarea
              {...register('witnesses')}
              rows={3}
              className="claims-form-textarea claims-form-textarea-default"
              placeholder="List any witnesses with their contact information..."
            />
          </FormField>
        </>
      )}
    </FormModal>
  );
};

export default React.memo(NewClaimModal);
