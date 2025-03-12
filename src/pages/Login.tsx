import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../services/authService';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      if (profile?.role === 'Client') {
        navigate('/client/dashboard');
      } else if (profile?.role === 'Vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid email or password');
    }
  };

  return (
    <div>Login component content</div>
  );
};

export default Login; 