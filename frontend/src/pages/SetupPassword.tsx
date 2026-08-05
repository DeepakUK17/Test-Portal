import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const SetupPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const setupToken = location.state?.setupToken;

  if (!setupToken) {
    // If someone tries to access this page directly without a token
    navigate('/login', { replace: true });
    return null;
  }

  const setupMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/setup-password', {
        setupToken,
        newPassword,
        confirmPassword,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password setup successfully! Please log in with your new password.');
      navigate('/login', { replace: true });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Password setup failed. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setupMutation.mutate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Set up your password</CardTitle>
          <CardDescription>This is your first login. Please choose a strong password.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="newPassword">New Password</label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="confirmPassword">Confirm Password</label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              type="submit" 
              disabled={setupMutation.isPending}
            >
              {setupMutation.isPending ? 'Setting Password...' : 'Save Password & Continue'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
