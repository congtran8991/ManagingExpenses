import React, { useState } from 'react';
import { useLoginMutation } from '../hooks/useAuthQueries';
import { Input } from '@/components/common/ui/Input';
import { Button } from '@/components/common/ui/Button'

export const LoginForm = () => {
    const loginMutation = useLoginMutation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        window.location.href = '/dashboard';
        // loginMutation.mutate({ email, password }, {
        //     onSuccess: () => { window.location.href = '/dashboard'; }
        // });
    };

    return (
        <form onSubmit={handleLogin} className="space-y-4">
            <Input type="email" placeholder="Nhập Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>Vào hệ thống</Button>
        </form>
    );
};