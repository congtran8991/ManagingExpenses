// src/features/finance/components/TransactionModal.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/common/ui/Dialog';
import { TransactionForm } from './TransactionForm';

interface TransactionModalProps {
  wallets: any[];
  jars: any[];
  defaultJarId?: number; // Cho phép truyền hoặc không
  triggerElement: React.ReactNode; // UI nút bấm kích hoạt tùy biến từ ngoài truyền vào
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  wallets,
  jars,
  defaultJarId,
  triggerElement,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerElement}</DialogTrigger>
      <DialogContent className="sm:max-w-[420px] bg-white p-6 rounded-xl border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-black text-slate-900">
            {defaultJarId ? 'Ghi chi tiêu nhanh cho Hũ này' : 'Ghi chép giao dịch mới'}
          </DialogTitle>
        </DialogHeader>
        <div className="pt-2">
          <TransactionForm
            wallets={wallets}
            jars={jars}
            defaultJarId={defaultJarId}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
