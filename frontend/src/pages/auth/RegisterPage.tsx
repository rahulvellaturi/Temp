import React from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-heading font-bold text-neutral-800">
            AssureMe
          </h1>
          <p className="mt-2 text-neutral-600">Create your account</p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-neutral-600">
            Registration form will be implemented here
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 text-primary hover:text-primary/80 font-medium"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;