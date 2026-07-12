// src/routes/_authenticated/transactions.tsx
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useGetTransactions, useGetWallets } from '@/features/finance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/Card';

export const Route = createFileRoute('/_authenticated/transactions')({
  component: TransactionsPage,
});

function TransactionsPage() {
  const { data: txs = [] } = useGetTransactions();
  const { data: wallets = [] } = useGetWallets();

  // Các state phục vụ bộ lọc tìm kiếm nâng cao
  const [searchNote, setSearchNote] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Logic filter dữ liệu vi mô tại chỗ
  const filteredTxs = txs.filter((t) => {
    const matchesSearch = t.note?.toLowerCase().includes(searchNote.toLowerCase());
    const matchesType = filterType === 'all' ? true : t.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-800">Nhật ký chi tiêu toàn cục</h1>
        <p className="text-xs text-slate-500">
          Nơi tra cứu và lọc tất cả các biến động tài chính lịch sử
        </p>
      </div>

      {/* THANH BỘ LỌC FILTER CHUYÊN NGHIỆP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border shadow-xs">
        <div className="sm:col-span-2">
          <input
            type="text"
            placeholder="Tìm kiếm nội dung giao dịch..."
            value={searchNote}
            onChange={(e) => setSearchNote(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">Tất cả loại giao dịch</option>
            <option value="income">💰 Khoản Thu (Income)</option>
            <option value="expense">💸 Khoản Chi (Expense)</option>
          </select>
        </div>
      </div>

      {/* BẢNG HIỂN THỊ DỮ LIỆU LỚN */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                <th className="p-4">Nội dung ghi chú</th>
                <th className="p-4">Phân loại</th>
                <th className="p-4 text-right">Số tiền biến động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-8 text-slate-400 text-xs">
                    Không tìm thấy dữ liệu phù hợp.
                  </td>
                </tr>
              ) : (
                filteredTxs.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{t.note}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${t.type === 'expense' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}
                      >
                        {t.type === 'expense' ? 'Chi tiêu' : 'Thu nhập'}
                      </span>
                    </td>
                    <td
                      className={`p-4 text-right font-bold ${t.type === 'expense' ? 'text-rose-600' : 'text-emerald-600'}`}
                    >
                      {t.type === 'expense' ? '-' : '+'}
                      {t.amount.toLocaleString()}đ
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
