// src/routes/_authenticated/budgets/$periodId.tsx
import { createFileRoute } from '@tanstack/react-router';
import { useGetWallets, useGetJars, useGetSavingsGoals } from '@/features/finance';
// CHUẨN HÓA ĐƯỜNG DẪN IMPORT (Viết thường /ui/card và /ui/button)
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/Card';
import { JarCreateModal } from '@/features/finance/components/JarCreateModal';
import { AllocateFundModal, SavingsGoalCard } from '@/features/finance';
import { TransactionModal } from '@/features/finance/components/TransactionModal';
import { Button } from '@/components/common/ui/Button';

export const Route = createFileRoute('/_authenticated/budgets/$periodId')({
    component: BudgetDetailPage,
});

interface JarCategory {
    id: number;
    period_id: number;
    name: string;
    allocated_amount: number;
    current_balance: number;
}

// HARDCODE DATA MẪU CHO 6 HŨ NHỎ ĐỒNG BỘ THEO TỪNG ID HŨ LỚN (PERIOD ID)
const MOCK_JARS: Record<number, JarCategory[]> = {
    // Data cho Hũ Lớn Tháng 06/2026 (periodId = 1)
    1: [
        { id: 101, period_id: 1, name: "🛒 Nhu cầu thiết yếu (NEC - 55%)", allocated_amount: 11000000, current_balance: 4500000 },
        { id: 102, period_id: 1, name: "🎓 Giáo dục & Phát triển (EDU - 10%)", allocated_amount: 2000000, current_balance: 2000000 },
        { id: 103, period_id: 1, name: "🎮 Hưởng thụ & Giải trí (PLAY - 10%)", allocated_amount: 2000000, current_balance: 350000 },
        { id: 104, period_id: 1, name: "💰 Tiết kiệm dài hạn (LTSS - 10%)", allocated_amount: 2000000, current_balance: 2000000 },
        { id: 105, period_id: 1, name: "📈 Quỹ đầu tư tự do (FFA - 10%)", allocated_amount: 2000000, current_balance: 1200000 },
        { id: 106, period_id: 1, name: "💝 Quỹ từ thiện / Cho đi (GIVE - 5%)", allocated_amount: 1000000, current_balance: 800000 },
    ],
    // Data cho Hũ Lớn Du Lịch Phú Quốc 2026 (periodId = 2)
    2: [
        { id: 201, period_id: 2, name: "✈️ Vé máy bay & Khách sạn", allocated_amount: 8000000, current_balance: 0 },
        { id: 202, period_id: 2, name: "🦑 Ăn uống & Hải sản", allocated_amount: 4000000, current_balance: 1500000 },
        { id: 203, period_id: 2, name: "🎁 Quà cáp lưu niệm", allocated_amount: 2000000, current_balance: 2000000 },
        { id: 204, period_id: 2, name: "🚕 Di chuyển & Taxi", allocated_amount: 1500000, current_balance: 600000 },
    ],
    // Data cho Hũ Lớn Lịch Sử Tháng 05/2026 (periodId = 3)
    3: [
        { id: 301, period_id: 3, name: "🛒 Nhu cầu thiết yếu (NEC)", allocated_amount: 10000000, current_balance: 12000 },
        { id: 302, period_id: 3, name: "🎓 Giáo dục (EDU)", allocated_amount: 1500000, current_balance: 0 },
        { id: 303, period_id: 3, name: "🎮 Hưởng thụ (PLAY)", allocated_amount: 2500000, current_balance: 0 },
        { id: 304, period_id: 3, name: "💰 Tiết kiệm (LTSS)", allocated_amount: 2000000, current_balance: 2000000 },
        { id: 305, period_id: 3, name: "📈 Đầu tư (FFA)", allocated_amount: 2000000, current_balance: 2000000 },
        { id: 306, period_id: 3, name: "💝 Từ thiện (GIVE)", allocated_amount: 1000000, current_balance: 50000 },
    ]
};

function BudgetDetailPage() {
    const { periodId } = Route.useParams();
    const currentPeriod = Number(periodId) || 1;

    const { data: wallets = [] } = useGetWallets();
    const { data: serverJars } = useGetJars(currentPeriod);
    const { data: goals = [] } = useGetSavingsGoals();

    // LOGIC CHECK DATA: Nếu server rỗng, lấy ngay tập dữ liệu mock tương ứng với currentPeriod
    const jars = (serverJars && serverJars.length > 0)
        ? serverJars
        : (MOCK_JARS[currentPeriod] || MOCK_JARS[1]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">

            {/* HEADER TỔNG CHỨA PHƯƠNG ÁN 1: NÚT TỔNG TOÀN CỤC */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-4 rounded-xl border shadow-xs">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Kế hoạch ngân sách phân bổ</span>
                    <h1 className="text-xl font-black text-slate-800">Chi tiết cấu trúc Hũ lớn #{currentPeriod}</h1>
                </div>

                {/* 🟢 PHƯƠNG ÁN 1: Nút tổng bên ngoài - Form trống tự chọn hũ */}
                <TransactionModal
                    wallets={wallets}
                    jars={jars}
                    triggerElement={
                        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer text-xs py-2 px-4 shadow-xs">
                            ⚡ Ghi thu / chi nhanh
                        </Button>
                    }
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    {/* Cột trái hiển thị Ví & Tích lũy (Giữ nguyên) */}
                    <Card>
                        <CardHeader><CardTitle className="text-base font-bold">Tài khoản ví khả dụng</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {wallets.map(w => (
                                <div key={w.id} className="flex justify-between items-center border-b pb-2 text-sm last:border-0 last:pb-0">
                                    <span className="text-slate-600 font-medium">{w.name}</span>
                                    <span className="font-bold text-slate-800">{w.balance.toLocaleString()}đ</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* CỘT PHẢI CHỨA DANH SÁCH CÁC HŨ NHỎ TÍCH HỢP PHƯƠNG ÁN 2 */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-base font-bold">Các hũ chi tiêu thành phần</CardTitle>
                            <JarCreateModal periodId={currentPeriod} />
                        </CardHeader>

                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {jars.map(j => (
                                <div key={j.id} className="border p-4 rounded-xl space-y-2 bg-white shadow-xs group relative">

                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-sm text-slate-800">{j.name}</h4>

                                        {/* CỤM NÚT ĐIỀU KHIỂN CỦA HŨ */}
                                        <div className="flex items-center gap-2">
                                            {/* 🔵 PHƯƠNG ÁN 2: Icon ví tiền nhỏ đặt trên từng hũ - Click phát tự điền hũ đó */}
                                            <TransactionModal
                                                wallets={wallets}
                                                jars={jars}
                                                defaultJarId={j.id} // Truyền ID hũ nhỏ vào đây
                                                triggerElement={
                                                    <button
                                                        title="Ghi nhanh chi tiêu cho hũ này"
                                                        className="p-1 rounded-md text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer text-xs font-bold"
                                                    >
                                                        💸 Chi
                                                    </button>
                                                }
                                            />

                                            {/* Nút cấp vốn nguyên bản */}
                                            <AllocateFundModal periodId={currentPeriod} categoryId={j.id} categoryName={j.name} wallets={wallets} />
                                        </div>
                                    </div>

                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                                        <div
                                            className="bg-indigo-600 h-full rounded-full transition-all"
                                            style={{ width: `${Math.min(100, (j.current_balance / j.allocated_amount) * 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs pt-1">
                                        <span className="text-slate-500">Còn lại: <strong className="text-slate-700">{j.current_balance.toLocaleString()}đ</strong></span>
                                        <span className="text-slate-400">Hạn mức: {j.allocated_amount.toLocaleString()}đ</span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}