import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { Building2 } from 'lucide-react';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.emailOrUsername) {
      setErrors({ emailOrUsername: 'Email or username is required' });
      return;
    }
    if (!formData.password) {
      setErrors({ password: 'Password is required' });
      return;
    }

    try {
      await login(formData.emailOrUsername, formData.password);
    } catch (error) {
      setErrors({ general: 'Invalid credentials' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Building2 className="h-8 w-8 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">CITBIF</h1>
          </div>
          <h2 className="text-xl text-gray-300">Welcome back</h2>
          <p className="text-sm text-gray-400 mt-2">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-900/20 border border-red-600/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            <Input
              label="Email or Username"
              name="emailOrUsername"
              type="text"
              value={formData.emailOrUsername}
              onChange={handleChange}
              error={errors.emailOrUsername}
              placeholder="Enter your email or username"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter your password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Sign In
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-400">Don't have an account? </span>
              <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium">
                Sign up
              </Link>
            </div>
          </form>
        </Card>

      </div>
    </div>
  );
};

export default Login;