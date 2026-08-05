import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const Login = () => {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const checkEmailMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/check-email', { email });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.data.requiresPasswordSetup) {
        navigate('/setup-password', { state: { setupToken: data.data.setupToken } });
      } else {
        setStep('password');
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Email not found. Please try again.');
    },
  });

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.data.requiresPasswordSetup) {
        // Redirect to setup password page with the setupToken
        navigate('/setup-password', { state: { setupToken: data.data.setupToken } });
      } else {
        // Save token and role to store
        localStorage.setItem('accessToken', data.data.accessToken);
        setAuth(data.data.accessToken, data.data.role);
        
        // Redirect based on role
        if (data.data.role === 'ADMIN') navigate('/admin/dashboard');
        else if (data.data.role === 'FACULTY') navigate('/faculty/dashboard');
        else navigate('/student/dashboard');
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (step === 'email') {
        checkEmailMutation.mutate();
    } else {
        loginMutation.mutate();
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-blue-600">
        <CardHeader className="space-y-3 text-center flex flex-col items-center">
          <img src="/logo.png" alt="KAHE Logo" className="h-20 w-20 object-contain mb-2" />
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">KAHE Coding Platform</CardTitle>
          <CardDescription className="text-gray-500">Sign in to access your assessments</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="m.name@kahedu.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={step === 'password'}
                required
              />
            </div>
            {step === 'password' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="password">Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              type="submit" 
              disabled={checkEmailMutation.isPending || loginMutation.isPending}
            >
              {checkEmailMutation.isPending || loginMutation.isPending ? 'Processing...' : (step === 'email' ? 'Continue' : 'Sign In')}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <div className="mt-8 text-center">
        <a href="https://deepakuk.me" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
            Developed by Deepak UK (24BTAD013)
        </a>
      </div>
    </div>
  );
};
