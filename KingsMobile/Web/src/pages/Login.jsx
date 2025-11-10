import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { User, Lock, Smartphone } from 'lucide-react';

export default function Login() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Demo credentials for easy testing
  const demoCredentials = [
    { role: 'Admin', username: 'admin', password: 'admin123' },
    { role: 'Sales Staff', username: 'sales_staff', password: 'sales123' },
    { role: 'Technician', username: 'technician', password: 'tech123' },
  ];

  const fillDemoCredentials = (username, password) => {
    setCredentials({ username, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-600 p-3 rounded-full">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-secondary-900">Kings Mobile</h1>
          <p className="text-secondary-600 mt-2">Management System</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-large">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="username"
                label="Username"
                type="text"
                value={credentials.username}
                onChange={handleInputChange}
                leftIcon={<User className="h-4 w-4" />}
                placeholder="Enter your username"
                required
              />

              <Input
                name="password"
                label="Password"
                type="password"
                value={credentials.password}
                onChange={handleInputChange}
                leftIcon={<Lock className="h-4 w-4" />}
                placeholder="Enter your password"
                required
              />

              {error && (
                <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
                  <p className="text-danger-700 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={!credentials.username || !credentials.password}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 pt-6 border-t border-secondary-200">
              <p className="text-sm text-secondary-600 mb-3 text-center">
                Demo Credentials (Click to fill)
              </p>
              <div className="space-y-2">
                {demoCredentials.map((cred, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => fillDemoCredentials(cred.username, cred.password)}
                    className="w-full text-left p-2 rounded-lg border border-secondary-200 hover:bg-secondary-50 transition-colors"
                  >
                    <div className="text-sm font-medium text-secondary-900">
                      {cred.role}
                    </div>
                    <div className="text-xs text-secondary-600">
                      {cred.username} / {cred.password}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-secondary-500">
          <p>© 2024 Kings Mobile. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
