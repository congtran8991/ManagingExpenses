import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';

export const Route = createFileRoute('/_authenticated/wallets')({
  component: WalletsDashboardComponent,
});

// 1. Định nghĩa kiểu dữ liệu cho Ví tiền
interface Wallet {
  id: string;
  name: string;
  type: 'CASH' | 'BANK' | 'CREDIT';
  balance: number;
  creditLimit?: number;
  color: string; // Tailwind gradient classes
}

// 2. Mock Data thực tế ban đầu (Đồng bộ với dữ liệu đã phân tích)
const MOCK_WALLETS: Wallet[] = [
  {
    id: 'w1',
    name: 'Tiền mặt xu hướng',
    type: 'CASH',
    balance: 2450000,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'w2',
    name: 'Tài khoản Vietcombank',
    type: 'BANK',
    balance: 15800000,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'w3',
    name: 'Techcombank Credit',
    type: 'CREDIT',
    balance: -4200000,
    creditLimit: 20000000,
    color: 'from-rose-500 to-red-600',
  },
];

function WalletsDashboardComponent() {
  const [wallets, setWallets] = useState<Wallet[]>(MOCK_WALLETS);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CASH' | 'BANK' | 'CREDIT'>('ALL');

  // Hàm format tiền tệ VND gọn gàng
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Tính toán tổng tài sản ròng
  const totalNetWorth = useMemo(() => {
    return wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  }, [wallets]);

  // Lọc danh sách ví theo tab đang chọn
  const filteredWallets = useMemo(() => {
    if (activeFilter === 'ALL') return wallets;
    return wallets.filter((w) => w.type === activeFilter);
  }, [wallets, activeFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Hệ thống Ví tài chính
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý dòng tiền, tài khoản ngân hàng và hạn mức tín dụng.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('Tính năng chuyển khoản nội bộ sẽ hiển thị Modal Form')}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all"
          >
            Chuyển tiền qua lại
          </button>
          <button
            onClick={() => alert('Tính năng thêm ví mới sẽ hiển thị Modal Form')}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-100 transition-all"
          >
            + Thêm ví mới
          </button>
        </div>
      </div>

      {/* NET WORTH HERO CARD */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Tổng tài sản ròng hiện tại
        </p>
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mt-1">
          <h2 className="text-4xl font-black tracking-tight">{formatCurrency(totalNetWorth)}</h2>
          <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md">
            ↑ 12.4% tháng này
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800 text-slate-400 text-xs sm:text-sm">
          <div>
            <p className="text-slate-500">Tiền mặt sở hữu</p>
            <p className="font-bold text-slate-200 mt-0.5">2,450,000 ₫</p>
          </div>
          <div>
            <p className="text-slate-500">Tiền gửi ngân hàng</p>
            <p className="font-bold text-slate-200 mt-0.5">15,800,000 ₫</p>
          </div>
          <div>
            <p className="text-slate-500">Dư nợ tín dụng</p>
            <p className="font-bold text-rose-400 mt-0.5">-4,200,000 ₫</p>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center border-b border-slate-200 gap-2 overflow-x-auto scrollbar-none">
        {(['ALL', 'CASH', 'BANK', 'CREDIT'] as const).map((filter) => {
          const labels = {
            ALL: 'Tất cả ví',
            CASH: 'Tiền mặt',
            BANK: 'Ngân hàng',
            CREDIT: 'Thẻ tín dụng',
          };
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all -mb-px ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {labels[filter]}
            </button>
          );
        })}
      </div>

      {/* WALLETS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWallets.map((wallet) => {
          const isCredit = wallet.type === 'CREDIT';
          const creditUsedPercent =
            isCredit && wallet.creditLimit
              ? Math.min(Math.round((Math.abs(wallet.balance) / wallet.creditLimit) * 100), 100)
              : 0;

          return (
            <div
              key={wallet.id}
              className={`p-6 rounded-2xl text-white shadow-md bg-gradient-to-br ${wallet.color} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col justify-between h-52 relative group`}
            >
              {/* Card Top */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold tracking-widest opacity-75 uppercase">
                    {wallet.type === 'CASH'
                      ? '💵 TIỀN MẶT'
                      : wallet.type === 'BANK'
                        ? '🏦 NGÂN HÀNG'
                        : '💳 TÍN DỤNG'}
                  </p>
                  <h3 className="text-lg font-bold mt-1 tracking-tight group-hover:text-slate-100 transition-colors">
                    {wallet.name}
                  </h3>
                </div>
                <span className="text-[11px] bg-white/20 font-medium px-2.5 py-0.5 rounded-full backdrop-blur-md">
                  Hoạt động
                </span>
              </div>

              {/* Card Bottom */}
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] opacity-70">Số dư khả dụng</p>
                  <p className="text-2xl font-black tracking-tight mt-0.5">
                    {formatCurrency(wallet.balance)}
                  </p>
                </div>

                {/* Phần bổ sung đặc trưng cho Thẻ tín dụng */}
                {isCredit && wallet.creditLimit && (
                  <div className="pt-2 border-t border-white/20">
                    <div className="flex justify-between text-[11px] opacity-80 mb-1">
                      <span>Hạn mức đã dùng</span>
                      <span className="font-bold">{creditUsedPercent}%</span>
                    </div>
                    <div className="w-full bg-white/25 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-white h-full rounded-full transition-all duration-500"
                        style={{ width: `${creditUsedPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {filteredWallets.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-400 text-sm">Không tìm thấy chiếc ví nào thuộc bộ lọc này.</p>
        </div>
      )}
    </div>
  );
}
