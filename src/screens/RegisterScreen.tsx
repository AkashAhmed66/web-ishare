import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { register } from '../redux/slices/authSlice';
import { COLORS, STYLES } from '../styles/theme';

const RegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      errors.name = 'Name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      errors.name = 'Name can only contain letters and spaces';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      // More flexible phone validation - allow various formats
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,15}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        errors.phone = 'Please enter a valid phone number (10-15 digits)';
      }
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    try {
      await dispatch(register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        role: 'rider'
      })).unwrap();
      
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: COLORS.text
      }}>
        Create Your Account
      </h2>
      
      {error && (
        <div style={{
          backgroundColor: `${COLORS.danger}20`,
          color: COLORS.danger,
          padding: '0.75rem',
          borderRadius: '4px',
          marginBottom: '1rem',
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Name Field */}
        <div style={{ marginBottom: '1rem' }}>
          <label 
            htmlFor="name"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: COLORS.text,
            }}
          >
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter your full name"
            required
            style={{
              ...STYLES.input,
              height: '2.5rem',
              border: validationErrors.name ? `1px solid ${COLORS.danger}` : STYLES.input.border,
            }}
          />
          {validationErrors.name && (
            <div style={{
              color: COLORS.danger,
              fontSize: '0.875rem',
              marginTop: '0.25rem',
            }}>
              {validationErrors.name}
            </div>
          )}
        </div>

        {/* Email Field */}
        <div style={{ marginBottom: '1rem' }}>
          <label 
            htmlFor="email"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: COLORS.text,
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email"
            required
            style={{
              ...STYLES.input,
              height: '2.5rem',
              border: validationErrors.email ? `1px solid ${COLORS.danger}` : STYLES.input.border,
            }}
          />
          {validationErrors.email && (
            <div style={{
              color: COLORS.danger,
              fontSize: '0.875rem',
              marginTop: '0.25rem',
            }}>
              {validationErrors.email}
            </div>
          )}
        </div>

        {/* Phone Field */}
        <div style={{ marginBottom: '1rem' }}>
          <label 
            htmlFor="phone"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: COLORS.text,
            }}
          >
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Enter your phone number"
            required
            style={{
              ...STYLES.input,
              height: '2.5rem',
              border: validationErrors.phone ? `1px solid ${COLORS.danger}` : STYLES.input.border,
            }}
          />
          {validationErrors.phone && (
            <div style={{
              color: COLORS.danger,
              fontSize: '0.875rem',
              marginTop: '0.25rem',
            }}>
              {validationErrors.phone}
            </div>
          )}
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: '1rem' }}>
          <label 
            htmlFor="password"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: COLORS.text,
            }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Enter your password"
            required
            style={{
              ...STYLES.input,
              height: '2.5rem',
              border: validationErrors.password ? `1px solid ${COLORS.danger}` : STYLES.input.border,
            }}
          />
          {validationErrors.password && (
            <div style={{
              color: COLORS.danger,
              fontSize: '0.875rem',
              marginTop: '0.25rem',
            }}>
              {validationErrors.password}
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label 
            htmlFor="confirmPassword"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: COLORS.text,
            }}
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder="Confirm your password"
            required
            style={{
              ...STYLES.input,
              height: '2.5rem',
              border: validationErrors.confirmPassword ? `1px solid ${COLORS.danger}` : STYLES.input.border,
            }}
          />
          {validationErrors.confirmPassword && (
            <div style={{
              color: COLORS.danger,
              fontSize: '0.875rem',
              marginTop: '0.25rem',
            }}>
              {validationErrors.confirmPassword}
            </div>
          )}
        </div>

        {/* Terms and Conditions */}
        <div style={{
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          color: COLORS.textSecondary,
          lineHeight: '1.5',
        }}>
          By creating an account, you agree to our{' '}
          <Link 
            to="/terms" 
            style={{ color: COLORS.primary, textDecoration: 'none' }}
          >
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link 
            to="/privacy" 
            style={{ color: COLORS.primary, textDecoration: 'none' }}
          >
            Privacy Policy
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            ...STYLES.buttonPrimary,
            width: '100%',
            height: '2.75rem',
            fontSize: '1rem',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      
      <div style={{
        marginTop: '2rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: COLORS.textSecondary,
      }}>
        Already have an account?{' '}
        <Link 
          to="/login"
          style={{
            color: COLORS.primary,
            textDecoration: 'none',
            fontWeight: '500',
          }}
        >
          Log in
        </Link>
      </div>
    </div>
  );
};

export default RegisterScreen; 