// src/components/common/MobileNavigation.tsx
import { Link, useLocation } from '@tanstack/react-router';

export const MobileNavigation = () => {
  const location = useLocation();

  // Hàm kiểm tra xem tab có đang active (được chọn) hay không để đổi màu
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 shadow-xl pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {/* TAB 1: DASHBOARD */}
        <Link
          to="/dashboard"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/dashboard') ? 'text-indigo-600 font-bold' : 'text-slate-400'
          }`}
        >
          <span className="text-xl">🏠</span>
          <span className="text-[10px] mt-0.5">Tổng quan</span>
        </Link>

        {/* TAB 2: NGÂN SÁCH (HŨ LỚN) */}
        <Link
          to="/budgets"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/budgets') ? 'text-indigo-600 font-bold' : 'text-slate-400'
          }`}
        >
          <span className="text-xl">📂</span>
          <span className="text-[10px] mt-0.5">Hũ ngân sách</span>
        </Link>

        {/* TAB 3: NHẬT KÝ (LỊCH SỬ) */}
        <Link
          to="/transactions"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/transactions') ? 'text-indigo-600 font-bold' : 'text-slate-400'
          }`}
        >
          <span className="text-xl">📜</span>
          <span className="text-[10px] mt-0.5">Nhật ký</span>
        </Link>

        {/* TAB 4: MỞ RỘNG / CÀI ĐẶT VÍ */}
        <div className="flex flex-col items-center justify-center flex-1 h-full text-slate-400 cursor-not-allowed">
          <span className="text-xl">💳</span>
          <span className="text-[10px] mt-0.5">Tài khoản ví</span>
        </div>
      </div>
    </div>
  );
};
