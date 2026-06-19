// src/apis/financeApi.ts
import { axiosClient } from './clients/axiosClient';
import { API_ENDPOINTS } from '@/constants';

// =========================================================================
// 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU (TYPES & INTERFACES) - KHỚP 100% DB.md
// =========================================================================

// Khớp với Bảng 1: users[cite: 2]
export interface UserProfile {
    id: number;
    username: string;
    email: string;
    created_at: string;
}

// Khớp với Bảng 2: wallets[cite: 2]
export interface Wallet {
    id: number;
    user_id: number;
    name: string;
    balance: number;
    created_at: string;
}

// Khớp với Bảng 3: budget_periods (Hũ Ngân Sách Lớn / Khoảng thời gian)[cite: 2, 3]
export interface BudgetPeriod {
    id: number;
    user_id: number;
    title: string;
    created_at: string;
}

// Khớp với Bảng 4: budget_categories (Hũ Ngân Sách Nhỏ)[cite: 2, 3]
export interface JarCategory {
    id: number;
    period_id: number;
    name: string;
    allocated_amount: number;
    current_balance: number;
}

// Khớp với Bảng 5: budget_transactions (Biến động tài chính)[cite: 2]
export interface Transaction {
    id: number;
    wallet_id: number;
    period_id: number;
    budget_category_id: number | null;
    type: 'income' | 'allocate' | 'expense' | 'transfer';
    amount: number;
    note: string | null;
    transaction_date: string;
}

// Khớp với Bảng 7: savings_goals (Mục tiêu tiết kiệm dài hạn)[cite: 2, 3]
export interface SavingsGoal {
    id: number;
    user_id: number;
    name: string;
    target_amount: number;
    current_amount: number;
    target_date: string | null;
    status: 'ongoing' | 'achieved';
    created_at: string;
}

// Định nghĩa dữ liệu truyền lên (Payloads) cho các API tác vụ
export interface CreateWalletPayload {
    name: string;
    balance: number;
}

export interface CreatePeriodPayload {
    title: string;
}

export interface AllocateFundPayload {
    wallet_id: number;
    budget_category_id: number;
    amount: number;
    note: string;
}

export interface CreateTransactionPayload {
    wallet_id: number;
    period_id: number;
    budget_category_id?: number; // Bắt buộc khi chi tiêu từ hũ, để trống khi nạp ví tổng[cite: 3]
    type: 'income' | 'expense';
    amount: number;
    note: string;
}

export interface TransferFundPayload {
    wallet_id: number;
    period_id: number;
    from_category_id: number;
    to_category_id: number;
    amount: number;
}

export interface CreateSavingsGoalPayload {
    name: string;
    target_amount: number;
    target_date?: string;
}

// =========================================================================
// 2. ĐỐI TƯỢNG ĐIỀU PHỐI API (FINANCE API ACTIONS)
// =========================================================================
export const financeApi = {

    // -----------------------------------------------------------------------
    // NHÓM 1: QUẢN LÝ VÍ THỦ CÔNG (Epic 1 - Task 1.3 & 1.4)[cite: 3, 4]
    // -----------------------------------------------------------------------

    // Lấy danh sách ví tài khoản của người dùng hiện tại[cite: 4]
    getWallets: (): Promise<Wallet[]> => {
        return axiosClient.get(API_ENDPOINTS.WALLETS);
    },

    // Tạo ví mới thủ công (Khai báo nguồn tiền - Task 1.3)[cite: 4]
    createWallet: (data: CreateWalletPayload): Promise<Wallet> => {
        return axiosClient.post(API_ENDPOINTS.WALLETS, data);
    },

    // Xoá ví tài khoản thủ công (Task 1.3)[cite: 4]
    deleteWallet: (id: number): Promise<void> => {
        return axiosClient.delete(`${API_ENDPOINTS.WALLETS}/${id}`);
    },

    // -----------------------------------------------------------------------
    // NHÓM 2: QUẢN LÝ HŨ NGÂN SÁCH LỚN / CHU KỲ (Epic 2 - Task 2.1)[cite: 3, 4]
    // -----------------------------------------------------------------------

    // Lấy danh sách toàn bộ các Hũ Lớn / Khoảng thời gian chu kỳ[cite: 4]
    getPeriods: (): Promise<BudgetPeriod[]> => {
        return axiosClient.get(API_ENDPOINTS.PERIODS.BASE);
    },

    // Khởi tạo một Hũ Lớn mới (Ví dụ: Chi tiêu tháng 6 - Task 2.1)[cite: 4]
    createPeriod: (data: CreatePeriodPayload): Promise<BudgetPeriod> => {
        return axiosClient.post(API_ENDPOINTS.PERIODS.BASE, data);
    },

    // -----------------------------------------------------------------------
    // NHÓM 3: QUẢN LÝ HŨ NHỎ & PHÂN BỔ VỐN (Epic 2 - Task 2.2)[cite: 3, 4]
    // -----------------------------------------------------------------------

    // Lấy danh sách các Hũ Nhỏ nằm bên trong một Hũ Lớn cố định
    getJarsByPeriod: (periodId: number): Promise<JarCategory[]> => {
        return axiosClient.get(API_ENDPOINTS.PERIODS.CATEGORIES(periodId));
    },

    // Cấp vốn ban đầu từ Ví tổng bỏ vào két các Hũ Nhỏ (Task 2.2)[cite: 3, 4]
    allocateFund: (periodId: number, data: AllocateFundPayload): Promise<void> => {
        return axiosClient.post(API_ENDPOINTS.PERIODS.CATEGORIES(periodId), data);
    },

    // -----------------------------------------------------------------------
    // NHÓM 4: GIAO DỊCH TIỀN PHÁT SÌNH THỰC TẾ (Epic 3 - Task 3.1 & 3.2)[cite: 3, 4]
    // -----------------------------------------------------------------------

    // Lấy toàn bộ dòng lịch sử ghi nhận thu chi trong hệ thống
    getTransactions: (): Promise<Transaction[]> => {
        return axiosClient.get(API_ENDPOINTS.TRANSACTIONS);
    },

    // Ghi nhận Khoản thu mới hoặc Khoản chi thực tế từ Hũ nhỏ (Task 3.1)[cite: 3, 4]
    createTransaction: (data: CreateTransactionPayload): Promise<Transaction> => {
        return axiosClient.post(API_ENDPOINTS.TRANSACTIONS, data);
    },

    // Chuyển quỹ cứu trợ trực tiếp qua lại giữa các hũ nhỏ (Task 3.2)[cite: 3, 4]
    transferCategoryFund: (data: TransferFundPayload): Promise<void> => {
        return axiosClient.post(`${API_ENDPOINTS.TRANSACTIONS}/transfer-category`, data);
    },

    // -----------------------------------------------------------------------
    // NHÓM 5: MỤC TIÊU TIẾT KIỆM DÀI HẠN (Epic 4 - Task 4.2)[cite: 3, 4]
    // -----------------------------------------------------------------------

    // Lấy danh sách các mục tiêu tích luỹ dài hạn tách biệt quỹ tháng
    getSavingsGoals: (): Promise<SavingsGoal[]> => {
        return axiosClient.get(API_ENDPOINTS.SAVINGS_GOALS.BASE);
    },

    // Khởi tạo một mục tiêu tích luỹ mới (Ví dụ: Mua xe - Task 4.2)[cite: 4]
    createSavingsGoal: (data: CreateSavingsGoalPayload): Promise<SavingsGoal> => {
        return axiosClient.post(API_ENDPOINTS.SAVINGS_GOALS.BASE, data);
    },

    // Trích tiền từ một ví bất kỳ nạp vào Quỹ tiết kiệm dài hạn (Task 4.2)[cite: 4]
    depositSavings: (id: number, data: { wallet_id: number; amount: number }): Promise<void> => {
        return axiosClient.post(API_ENDPOINTS.SAVINGS_GOALS.DEPOSIT(id), data);
    }
};