import React from 'react';
import { authActions } from '@/features/auth/store/useAuthStore';
import { Button } from '@/components/common/ui/Button';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50/50">
            <header className="border-b bg-white px-6 py-3 flex justify-between items-center sticky top-0 z-40 shadow-xs">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-slate-900" />
                    <span className="font-bold text-sm tracking-tight text-slate-800">SmartFinance Enterprise</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => authActions.logout()}>Đăng xuất</Button>
            </header>
            <div className="flex-1 w-full">{children}</div>
        </div>
    );
};