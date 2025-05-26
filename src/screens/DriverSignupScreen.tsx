import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import { COLORS, STYLES } from '../styles/theme';

const DriverSignupScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    address: '',
    
    // Vehicle Information
    vehicleType: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    licensePlate: '',
    
    // Documents
    driverLicense: null as File | null,
    vehicleRegistration: null as File | null,
    insurance: null as File | null,
    profilePhoto: null as File | null,
    
    // Banking
    bankAccount: '',
    routingNumber: '',
    taxId: '',
    
    // Agreement
    agreedToTerms: false,
    agreedToBackground: false
  });

  const vehicleTypes = [
    { id: 'sedan', name: 'Sedan', icon: '🚗', description: '4 passengers' },
    { id: 'suv', name: 'SUV/Van', icon: '🚙', description: '6-8 passengers' },
    { id: 'luxury', name: 'Luxury', icon: '🏎️', description: 'Premium vehicles' },
    { id: 'eco', name: 'Eco-Friendly', icon: '🔋', description: 'Hybrid/Electric' }
  ];

  const steps = [
    { id: 1, title: 'Personal Info', icon: '👤' },
    { id: 2, title: 'Vehicle Details', icon: '🚗' },
    { id: 3, title: 'Documents', icon: '📄' },
    { id: 4, title: 'Banking', icon: '💳' },
    { id: 5, title: 'Review', icon: '✅' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Here you would submit the driver application
      console.log('Submitting driver application:', formData);
      
      // Simulate API call
      setTimeout(() => {
        alert('Driver application submitted successfully! You will be notified once your application is reviewed.');
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Failed to submit application:', error);
    }
  };

  const renderStepIndicator = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '2rem',
      gap: '1rem'
    }}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: currentStep >= step.id ? COLORS.primary : COLORS.border,
              color: currentStep >= step.id ? COLORS.white : COLORS.textSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}>
              {currentStep > step.id ? '✓' : step.icon}
            </div>
            <span style={{
              fontSize: '0.8rem',
              color: currentStep >= step.id ? COLORS.primary : COLORS.textSecondary,
              fontWeight: currentStep === step.id ? 'bold' : 'normal'
            }}>
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div style={{
              width: '40px',
              height: '2px',
              backgroundColor: currentStep > step.id ? COLORS.primary : COLORS.border,
              transition: 'all 0.3s ease'
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderPersonalInfo = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: '1rem'
      }}>
        👤 Personal Information
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.9rem', color: COLORS.textSecondary, marginBottom: '0.5rem', display: 'block' }}>
            First Name *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            style={STYLES.input}
            placeholder="Enter first name"
          />
        </div>
        <div>
          <label style={{ fontSize: '0.9rem', color: COLORS.textSecondary, marginBottom: '0.5rem', display: 'block' }}>
            Last Name *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            style={STYLES.input}
            placeholder="Enter last name"
          />
        </div>
      </div>

      <div>
        <label style={{ fontSize: '0.9rem', color: COLORS.textSecondary, marginBottom: '0.5rem', display: 'block' }}>
          Phone Number *
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          style={STYLES.input}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div>
        <label style={{ fontSize: '0.9rem', color: COLORS.textSecondary, marginBottom: '0.5rem', display: 'block' }}>
          Email Address *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          style={STYLES.input}
          placeholder="your.email@example.com"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.9rem', color: COLORS.textSecondary, marginBottom: '0.5rem', display: 'block' }}>
            Date of Birth *
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            style={STYLES.input}
          />
        </div>
        <div></div>
      </div>

      <div>
        <label style={{ fontSize: '0.9rem', color: COLORS.textSecondary, marginBottom: '0.5rem', display: 'block' }}>
          Address *
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          style={{ ...STYLES.input, minHeight: '80px', resize: 'vertical' }}
          placeholder="Enter your full address"
        />
      </div>
    </div>
  );

  const renderVehicleDetails = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: '1rem'
      }}>
        🚗 Vehicle Information
      </h2>

      <div>
        <label style={{ fontSize: '0.9rem', color: COLORS.textSecondary, marginBottom: '1rem', display: 'block' }}>
          Vehicle Type *
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {vehicleTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleInputChange('vehicleType', type.id)}
              style={{
                padding: '1rem',
                border: formData.vehicleType === type.id ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
                borderRadius: '12px',
                backgroundColor: formData.vehicleType === type.id ? COLORS.accent : COLORS.background,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{type.icon}</span>
                <span style={{ fontWeight: 'bold', color: COLORS.text }}>{type.name}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>{type.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.9rem', color: COLORS.textSecondary, marginBottom: '0.5rem', display: 'block' }}>
            Make *
          </label>
          <input
            type="text"
            value={formData.vehicleMake}
            onChange={(e) => handleInputChange('vehicleMake', e.target.value)}
            style={STYLES.input}
            placeholder="e.g. Toyota"
          />
        </div>
        <div>
          <label style={{ fontSize: '0.9rem', color: COLORS.textSecondary, marginBottom: '0.5rem', display: 'block' }}>
            Model *
          </label>
          <input
            type="text"
            value={formData.vehicleModel}
            onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
            style={STYLES.input}
            placeholder="e.g. Camry"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.9rem', color: COLORS.textSecondary, marginBottom: '0.5rem', display: 'block' }}>
            Year *
          </label>
          <input
            type="number"
            value={formData.vehicleYear}
            onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
            style={STYLES.input}
            placeholder="2020"
            min="2010"
            max={new Date().getFullYear()}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.9rem', color: COLORS.textSecondary, marginBottom: '0.5rem', display: 'block' }}>
            Color *
          </label>
          <input
            type="text"
            value={formData.vehicleColor}
            onChange={(e) => handleInputChange('vehicleColor', e.target.value)}
            style={STYLES.input}
            placeholder="e.g. White"
          />
        </div>
        <div>
          <label style={{ fontSize: '0.9rem', color: COLORS.textSecondary, marginBottom: '0.5rem', display: 'block' }}>
            License Plate *
          </label>
          <input
            type="text"
            value={formData.licensePlate}
            onChange={(e) => handleInputChange('licensePlate', e.target.value.toUpperCase())}
            style={STYLES.input}
            placeholder="ABC123"
          />
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: '1rem'
      }}>
        📄 Required Documents
      </h2>

      <p style={{ color: COLORS.textSecondary, fontSize: '0.9rem', lineHeight: '1.5' }}>
        Please upload clear photos of the following documents. All documents must be valid and not expired.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {[
          { key: 'driverLicense', title: 'Driver\'s License', icon: '🪪', required: true },
          { key: 'vehicleRegistration', title: 'Vehicle Registration', icon: '📋', required: true },
          { key: 'insurance', title: 'Insurance Certificate', icon: '🛡️', required: true },
          { key: 'profilePhoto', title: 'Profile Photo', icon: '📸', required: true }
        ].map((doc) => (
          <div key={doc.key} style={{
            padding: '1.5rem',
            border: `2px dashed ${formData[doc.key as keyof typeof formData] ? COLORS.primary : COLORS.border}`,
            borderRadius: '12px',
            backgroundColor: formData[doc.key as keyof typeof formData] ? COLORS.accent : COLORS.background,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{doc.icon}</div>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 'bold',
              color: COLORS.text,
              margin: '0 0 0.5rem 0'
            }}>
              {doc.title} {doc.required && <span style={{ color: COLORS.error }}>*</span>}
            </h3>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileUpload(doc.key, e.target.files?.[0] || null)}
              style={{ display: 'none' }}
              id={doc.key}
            />
            <label
              htmlFor={doc.key}
              style={{
                ...STYLES.buttonSecondary,
                display: 'inline-block',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              {formData[doc.key as keyof typeof formData] ? 'Change File' : 'Choose File'}
            </label>
            {formData[doc.key as keyof typeof formData] && (
              <div style={{
                fontSize: '0.8rem',
                color: COLORS.textSecondary,
                marginTop: '0.5rem'
              }}>
                ✓ File uploaded
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderBanking = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: '1rem'
      }}>
        💳 Banking Information
      </h2>

      <div style={{
        padding: '1rem',
        backgroundColor: COLORS.accent,
        borderRadius: '12px',
        border: `1px solid ${COLORS.primary}`
      }}>
        <p style={{ color: COLORS.text, fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
          🔒 Your banking information is securely encrypted and will only be used for payment processing.
        </p>
      </div>

      <div>
        <label style={{ fontSize: '0.9rem', color: COLORS.textSecondary, marginBottom: '0.5rem', display: 'block' }}>
          Bank Account Number *
        </label>
        <input
          type="text"
          value={formData.bankAccount}
          onChange={(e) => handleInputChange('bankAccount', e.target.value)}
          style={STYLES.input}
          placeholder="Account number"
        />
      </div>

      <div>
        <label style={{ fontSize: '0.9rem', color: COLORS.textSecondary, marginBottom: '0.5rem', display: 'block' }}>
          Routing Number *
        </label>
        <input
          type="text"
          value={formData.routingNumber}
          onChange={(e) => handleInputChange('routingNumber', e.target.value)}
          style={STYLES.input}
          placeholder="9-digit routing number"
        />
      </div>

      <div>
        <label style={{ fontSize: '0.9rem', color: COLORS.textSecondary, marginBottom: '0.5rem', display: 'block' }}>
          Tax ID / SSN *
        </label>
        <input
          type="text"
          value={formData.taxId}
          onChange={(e) => handleInputChange('taxId', e.target.value)}
          style={STYLES.input}
          placeholder="XXX-XX-XXXX"
        />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          cursor: 'pointer',
          marginBottom: '1rem'
        }}>
          <input
            type="checkbox"
            checked={formData.agreedToTerms}
            onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
            style={{ marginTop: '0.25rem' }}
          />
          <span style={{ fontSize: '0.9rem', color: COLORS.text, lineHeight: '1.4' }}>
            I agree to the <a href="#" style={{ color: COLORS.primary }}>Terms of Service</a> and 
            <a href="#" style={{ color: COLORS.primary }}> Privacy Policy</a>
          </span>
        </label>

        <label style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          cursor: 'pointer'
        }}>
          <input
            type="checkbox"
            checked={formData.agreedToBackground}
            onChange={(e) => handleInputChange('agreedToBackground', e.target.checked)}
            style={{ marginTop: '0.25rem' }}
          />
          <span style={{ fontSize: '0.9rem', color: COLORS.text, lineHeight: '1.4' }}>
            I consent to a background check and understand that approval is required before I can start driving
          </span>
        </label>
      </div>
    </div>
  );

  const renderReview = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: '1rem'
      }}>
        ✅ Review Your Application
      </h2>

      <div style={{
        padding: '1.5rem',
        backgroundColor: COLORS.accent,
        borderRadius: '12px',
        border: `1px solid ${COLORS.primary}`
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: COLORS.text, margin: '0 0 1rem 0' }}>
          🎉 You're almost ready to drive!
        </h3>
        <p style={{ color: COLORS.text, fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
          After submitting your application, our team will review your documents and run a background check. 
          This process typically takes 1-3 business days. You'll receive an email notification once approved.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          padding: '1rem',
          backgroundColor: COLORS.background,
          borderRadius: '12px'
        }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: COLORS.text, margin: '0 0 0.5rem 0' }}>
            Personal Information
          </h4>
          <p style={{ fontSize: '0.8rem', color: COLORS.textSecondary, margin: 0 }}>
            {formData.firstName} {formData.lastName}<br />
            {formData.phone}<br />
            {formData.email}
          </p>
        </div>

        <div style={{
          padding: '1rem',
          backgroundColor: COLORS.background,
          borderRadius: '12px'
        }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: COLORS.text, margin: '0 0 0.5rem 0' }}>
            Vehicle Details
          </h4>
          <p style={{ fontSize: '0.8rem', color: COLORS.textSecondary, margin: 0 }}>
            {formData.vehicleYear} {formData.vehicleMake} {formData.vehicleModel}<br />
            {formData.vehicleColor}<br />
            License: {formData.licensePlate}
          </p>
        </div>

        <div style={{
          padding: '1rem',
          backgroundColor: COLORS.background,
          borderRadius: '12px'
        }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: COLORS.text, margin: '0 0 0.5rem 0' }}>
            Documents Status
          </h4>
          <div style={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>
            {formData.driverLicense && <div>✓ Driver's License</div>}
            {formData.vehicleRegistration && <div>✓ Vehicle Registration</div>}
            {formData.insurance && <div>✓ Insurance</div>}
            {formData.profilePhoto && <div>✓ Profile Photo</div>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderPersonalInfo();
      case 2: return renderVehicleDetails();
      case 3: return renderDocuments();
      case 4: return renderBanking();
      case 5: return renderReview();
      default: return renderPersonalInfo();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.background,
      padding: '1rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '2rem',
        backgroundColor: COLORS.white,
        padding: '1rem',
        borderRadius: '12px',
        boxShadow: STYLES.card.boxShadow
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            ...STYLES.buttonSecondary,
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '1rem'
          }}
        >
          ←
        </button>
        <div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: COLORS.text,
            margin: 0
          }}>
            🚗 Become a Driver
          </h1>
          <p style={{
            color: COLORS.textSecondary,
            margin: 0,
            fontSize: '0.9rem'
          }}>
            Join thousands of drivers earning with IShare
          </p>
        </div>
      </div>

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: COLORS.white,
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: STYLES.card.boxShadow
      }}>
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        {renderCurrentStep()}

        {/* Navigation Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: `1px solid ${COLORS.border}`
        }}>
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            style={{
              ...STYLES.buttonSecondary,
              opacity: currentStep === 1 ? 0.5 : 1,
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            ← Previous
          </button>

          <div style={{
            fontSize: '0.9rem',
            color: COLORS.textSecondary
          }}>
            Step {currentStep} of {steps.length}
          </div>

          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              style={STYLES.buttonPrimary}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.agreedToTerms || !formData.agreedToBackground}
              style={{
                ...STYLES.buttonPrimary,
                opacity: (!formData.agreedToTerms || !formData.agreedToBackground) ? 0.5 : 1,
                cursor: (!formData.agreedToTerms || !formData.agreedToBackground) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '🔄 Submitting...' : '🚀 Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverSignupScreen; 