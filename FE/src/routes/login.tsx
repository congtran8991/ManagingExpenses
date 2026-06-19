import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { LoginForm } from '@/features/auth';
import { AuthLayout } from '@/components/layout/AuthLayout';

export const Route = createFileRoute('/login')({
    component: () => (
        <AuthLayout>
            <LoginForm />
        </AuthLayout>
    ),
});