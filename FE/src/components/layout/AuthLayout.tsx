import React from 'react';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl border shadow-xs">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Két Sắt Tài Chính</h2>
          <p className="text-sm text-slate-500">Hệ thống hũ phân bổ ngân sách tối ưu</p>
        </div>
        {children}
      </div>
    </div>
  );
};
