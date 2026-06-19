import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const Route = createFileRoute('/_authenticated')({
    // beforeLoad: async () => {
    //     const isAuthed = !!localStorage.getItem('finance_access_token');
    //     if (!isAuthed) throw redirect({ to: '/login' });
    // },
    component: () => (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    ),
});