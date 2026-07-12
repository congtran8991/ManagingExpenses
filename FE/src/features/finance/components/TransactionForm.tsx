// src/features/finance/components/TransactionForm.tsx
import React, { useState, useEffect } from 'react';

interface Wallet {
  id: number;
  name: string;
  balance: number;
}

interface Jar {
  id: number;
  name: string;
}

interface TransactionFormProps {
  wallets: Wallet[];
  jars: Jar[];
  defaultJarId?: number; // ID hũ truyền vào nếu bấm từ hũ nhỏ cụ thể
  onSuccess?: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  wallets,
  jars,
  defaultJarId,
  onSuccess,
}) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [walletId, setWalletId] = useState('');
  const [jarId, setJarId] = useState('');
  const [note, setNote] = useState('');

  // Tự động chọn sẵn hũ nếu có defaultJarId truyền vào
  useEffect(() => {
    if (defaultJarId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setJarId(String(defaultJarId));
      setType('expense'); // Bấm từ hũ nhỏ thì chắc chắn là đi Chi tiêu
    }
  }, [defaultJarId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // BACKEND API LOGIC HERE
    console.log('Submit Transaction:', { type, amount: Number(amount), walletId, jarId, note });

    // Reset Form & Đóng Modal
    setAmount('');
    setNote('');
    if (!defaultJarId) setJarId('');
    if (onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Chọn loại Thu / Chi (Chỉ cho đổi nếu không bấm từ hũ nhỏ) */}
      {!defaultJarId && (
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            className={`py-1.5 text-xs font-bold rounded-md transition-all ${type === 'expense' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-500'}`}
            onClick={() => setType('expense')}
          >
            💸 Khoản Chi (Expense)
          </button>
          <button
            type="button"
            className={`py-1.5 text-xs font-bold rounded-md transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500'}`}
            onClick={() => setType('income')}
          >
            💰 Khoản Thu (Income)
          </button>
        </div>
      )}

      {/* Số tiền */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 block">Số tiền (VND)</label>
        <input
          type="number"
          required
          placeholder="Nhập số tiền..."
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Chọn Ví tiền thực tế */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 block">Chọn Ví thanh toán</label>
        <select
          required
          value={walletId}
          onChange={(e) => setWalletId(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
        >
          <option value="">-- Chọn một Ví nguồn --</option>
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} (+{w.balance.toLocaleString()}đ)
            </option>
          ))}
        </select>
      </div>

      {/* Chọn Hũ hạn mức (Chỉ hiện khi là Khoản Chi) */}
      {type === 'expense' && (
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 block">Gán nhãn vào Hũ hạn mức</label>
          <select
            required
            disabled={!!defaultJarId} // Khóa lại nếu đã chọn sẵn từ hũ nhỏ
            value={jarId}
            onChange={(e) => setJarId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 disabled:opacity-75 disabled:bg-slate-100 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">-- Chọn một Hũ nhỏ --</option>
            {jars.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Ghi chú */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 block">Ghi chú giao dịch</label>
        <input
          type="text"
          placeholder="Ví dụ: Mua cốc cafe, ăn trưa..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-sm shadow-xs cursor-pointer transition-all mt-2"
      >
        Xác nhận lưu giao dịch
      </button>
    </form>
  );
};
