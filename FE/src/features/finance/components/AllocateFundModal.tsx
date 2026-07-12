import React, { useState } from 'react';
import { useAllocateFund } from '../hooks/useFinanceQueries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/common/ui/Dialog';
import { Button } from '@/components/common/ui/Button';
import { Input } from '@/components/common/ui/Input';

export const AllocateFundModal: React.FC<{
  periodId: number;
  categoryId: number;
  categoryName: string;
  wallets: any[];
}> = ({ periodId, categoryId, categoryName, wallets }) => {
  const [open, setOpen] = useState(false);
  const [walletId, setWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const allocate = useAllocateFund(periodId);

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    allocate.mutate(
      {
        wallet_id: Number(walletId),
        budget_category_id: categoryId,
        amount: Number(amount),
        note: `Nạp hũ ${categoryName}`,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setAmount('');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Nạp hũ
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nạp tiền vào hũ: {categoryName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAllocate} className="space-y-3 pt-2">
          <select
            className="w-full border rounded-md p-2 text-sm bg-background"
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            required
          >
            <option value="">-- Trích từ ví --</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.balance.toLocaleString()}đ)
              </option>
            ))}
          </select>
          <Input
            type="number"
            placeholder="Số tiền cấp hạn mức"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Hoàn thành
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
