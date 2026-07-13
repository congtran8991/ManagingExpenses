import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useLoginMutation } from '../hooks/useAuthQueries';
import { Input } from '@/components/common/ui/Input';
import { Button } from '@/components/common/ui/Button';
import { authActions } from '../store/useAuthStore';

export const LoginForm = () => {
  const navigate = useNavigate();

  const { mutate, isPending } = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  console.log('s');
  const handleLogin = (e: React.ChangeEvent) => {
    e.preventDefault();
    e.stopPropagation();

    mutate(
      { email, password },
      {
        onSuccess: (data) => {
          console.log('shvwwwhưs1ư');
          navigate({ to: '/dashboard' });
        },
      }
    );
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <Input
        type="email"
        placeholder="Nhập Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Mật khẩu"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" className="w-full" disabled={isPending}>
        Vào hệ thống
      </Button>
    </form>
  );
};
