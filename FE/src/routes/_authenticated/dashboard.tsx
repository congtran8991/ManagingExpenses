// src/routes/_authenticated/dashboard.tsx
import { createFileRoute, Link } from '@tanstack/react-router';
import { useGetWallets, useGetTransactions } from '@/features/finance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/Card';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: wallets = [] } = useGetWallets();
  const { data: txs = [] } = useGetTransactions();

  const total = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
  // Lấy 5 giao dịch gần đây nhất để hiển thị nhanh
  const recentTxs = txs.slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-800">Bảng điều khiển tổng quan</h1>
      </div>

      {/* Grid thống kê nhanh tài sản */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 text-white md:col-span-2 shadow-md">
          <CardHeader>
            <p className="text-xs text-slate-400 uppercase font-medium">Tổng tài sản các ví</p>
            <CardTitle className="text-3xl font-black">{total.toLocaleString()} VND</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-white border shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-500">
              Số lượng tài khoản ví
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-800">{wallets.length} Ví hoạt động</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Khối danh sách ví */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold">Số dư tài khoản ví</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {wallets.map((w) => (
              <div
                key={w.id}
                className="flex justify-between items-center border-b pb-2 text-sm last:border-0 last:pb-0"
              >
                <span className="text-slate-600 font-medium">{w.name}</span>
                <span className="font-bold text-emerald-600">+{w.balance.toLocaleString()}đ</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Khối 5 giao dịch gần đây */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-bold">Giao dịch gần đây</CardTitle>
            <Link to="/transactions" className="text-xs font-bold text-indigo-600 hover:underline">
              Xem tất cả →
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTxs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                Chưa có giao dịch nào được ghi nhận.
              </p>
            ) : (
              recentTxs.map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between items-center border-b pb-2 text-sm last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{t.note}</p>
                    <p className="text-xs text-slate-400">ID Ví: {t.wallet_id}</p>
                  </div>
                  <span
                    className={
                      t.type === 'expense' ? 'text-red-500 font-bold' : 'text-emerald-600 font-bold'
                    }
                  >
                    {t.type === 'expense' ? '-' : '+'}
                    {t.amount.toLocaleString()}đ
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
