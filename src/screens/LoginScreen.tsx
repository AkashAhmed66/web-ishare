import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { login } from '../redux/slices/authSlice';
import { COLORS, STYLES } from '../styles/theme';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      return;
    }
    
    try {
      await dispatch(login({ email, password })).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
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
        Login to Your Account
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={{
              ...STYLES.input,
              height: '2.5rem',
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
          }}>
            <label 
              htmlFor="password"
              style={{
                fontWeight: '500',
                color: COLORS.text,
              }}
            >
              Password
            </label>
            <Link 
              to="/forgot-password"
              style={{
                fontSize: '0.875rem',
                color: COLORS.primary,
                textDecoration: 'none',
              }}
            >
              Forgot Password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            style={{
              ...STYLES.input,
              height: '2.5rem',
            }}
          />
        </div>
        
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
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div style={{
        marginTop: '2rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: COLORS.textSecondary,
      }}>
        Don't have an account?{' '}
        <Link 
          to="/register"
          style={{
            color: COLORS.primary,
            textDecoration: 'none',
            fontWeight: '500',
          }}
        >
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default LoginScreen; 