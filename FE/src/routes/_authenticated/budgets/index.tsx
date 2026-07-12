import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { financeApi } from '@/apis/financeApi';
import { QUERY_KEYS } from '@/constants';
import { PeriodCard } from '@/features/finance/components/PeriodCard';
import { PeriodCreateModal } from '@/features/finance/components/PeriodCreateModal';

export const Route = createFileRoute('/_authenticated/budgets/')({
  component: BudgetPage,
});

// HARDCODE DATA MẪU (MOCK DATA) ĐỂ HIỂN THỊ UI
const MOCK_PERIODS = [
  {
    id: 1,
    title: 'Ngân sách Quản lý tháng 06/2026',
    created_at: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 2,
    title: 'Chiến dịch Du lịch hè Phú Quốc 2026',
    created_at: '2026-06-10T07:30:00.000Z',
  },
  {
    id: 3,
    title: 'Lịch sử Ngân sách tháng 05/2026',
    created_at: '2026-05-01T00:00:00.000Z',
  },
];

function BudgetPage() {
  // Lấy dữ liệu từ API
  const { data: serverPeriods = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.PERIODS],
    queryFn: financeApi.getPeriods,
    retry: false, // Tắt retry để nếu lỗi hoặc chưa có backend thì dùng luôn mock data
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm font-medium">
        Đang tải danh sách hũ ngân sách lớn...
      </div>
    );
  }

  // LOGIC TRẢ VỀ: Nếu server trống (chưa có kết nối DB), lấy tạm data hardcode để xem UI
  const displayPeriods = serverPeriods.length > 0 ? serverPeriods : MOCK_PERIODS;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* KHỐI TIÊU ĐỀ CHỨA NÚT TẠO HŨ LỚN */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-5 rounded-xl border shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Danh Sách Hũ Lớn & Chu Kỳ
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý các khoảng thời gian ngân sách tổng quát (`budget_periods`).
          </p>
        </div>

        {/* NÚT TẠO HŨ LỚN (Đã sửa lỗi logic bấm là hiện) */}
        <PeriodCreateModal />
      </div>

      {/* LƯỚI DANH SÁCH CÁC HŨ NGÂN SÁCH LỚN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayPeriods.map((period) => (
          <PeriodCard key={period.id} period={period} />
        ))}
      </div>
    </div>
  );
}
