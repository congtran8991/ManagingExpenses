import React, { useState } from 'react';
import { useDepositSavings } from '../hooks/useFinanceQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/Card';
import { Button } from '@/components/common/ui/Button';
import { Input } from '@/components/common/ui/Input';

export const SavingsGoalCard: React.FC<{ goal: any; wallets: any[] }> = ({ goal, wallets }) => {
  const [amount, setAmount] = useState('');
  const [walletId, setWalletId] = useState('');
  const deposit = useDepositSavings();

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletId || !amount) return;
    deposit.mutate(
      { id: goal.id, wallet_id: Number(walletId), amount: Number(amount) },
      { onSuccess: () => setAmount('') }
    );
  };

  const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100);

  return (
    <Card className="bg-slate-50/50">
      <CardHeader className="pb-1">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xs font-bold text-slate-700">{goal.name}</CardTitle>
          <span className="text-[10px] font-semibold">{Math.round(pct)}%</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
        </div>
        {goal.status !== 'achieved' && (
          <form onSubmit={handleDeposit} className="flex gap-1">
            <select
              className="border rounded px-1 text-[11px] bg-background"
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              required
            >
              <option value="">Ví</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            <Input
              type="number"
              placeholder="Số tiền"
              className="h-6 text-xs flex-1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <Button type="submit" size="sm" className="h-6 text-xs px-2">
              Nạp
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
