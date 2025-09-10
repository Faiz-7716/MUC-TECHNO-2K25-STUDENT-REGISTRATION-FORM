"use client";

import { useState } from 'react';
import type { AccessLevel } from '@/app/admin/page';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: (accessLevel: AccessLevel) => void;
}

const ADMIN_PASSWORD = "muc-admin-25";
const VIEWER_PASSWORD = "admin";

export default function LoginModal({ onLoginSuccess }: LoginModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setError('');
      onLoginSuccess('admin');
    } else if (password === VIEWER_PASSWORD) {
      setError('');
      onLoginSuccess('viewer');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline text-2xl text-primary">
            <KeyRound /> Admin Access Required
          </DialogTitle>
          <DialogDescription>
            Please enter the password to access the dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter password"
            className="col-span-3"
          />
          {error && <p className="text-destructive text-sm mt-2">{error}</p>}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleLogin} className="w-full">
            Unlock Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
