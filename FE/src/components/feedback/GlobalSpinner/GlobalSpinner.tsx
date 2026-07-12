import React from 'react';

export const GlobalSpinner: React.FC<{ isLoading?: boolean }> = ({ isLoading = false }) => {
  if (!isLoading) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-background/60 backdrop-blur-xs">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
    </div>
  );
};
