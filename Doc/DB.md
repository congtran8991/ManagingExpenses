-- =========================================================================
-- PHẦN 1: CÁC BẢNG CỐT LÕI (CORE TABLES)
-- =========================================================================

-- 1. Bảng Người dùng
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Ví Thủ Công
CREATE TABLE wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,         -- Ví dụ: Tiền mặt, Thẻ Techcombank, Ví Momo
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00, -- Số dư thực tế hiện tại
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Bảng Hũ Ngân Sách Lớn / Khoảng thời gian
CREATE TABLE budget_periods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,        -- Ví dụ: Chi tiêu tháng 5, Du lịch hè 2026
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Bảng Hũ Ngân Sách Nhỏ
CREATE TABLE budget_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,         -- Ví dụ: Chi cho con, Ăn uống, Đi chơi
    allocated_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00, -- Số vốn ban đầu gán cho hũ
    current_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,  -- Số tiền hiện tại còn lại trong hũ
    FOREIGN KEY (period_id) REFERENCES budget_periods(id) ON DELETE CASCADE
);

-- 5. Bảng Giao dịch / Biến động tài chính (Thêm trạng thái 'transfer')
CREATE TABLE budget_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_id INT NOT NULL,              
    period_id INT NOT NULL,              
    budget_category_id INT NULL,         
    type ENUM('income', 'allocate', 'expense', 'transfer') NOT NULL, -- Thêm 'transfer' để phục vụ chuyển quỹ
    amount DECIMAL(15, 2) NOT NULL,      
    note TEXT,                           
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    FOREIGN KEY (period_id) REFERENCES budget_periods(id) ON DELETE CASCADE,
    FOREIGN KEY (budget_category_id) REFERENCES budget_categories(id) ON DELETE CASCADE
);


-- =========================================================================
-- PHẦN 2: CÁC BẢNG TÍNH NĂNG MỞ RỘNG (EXTENSION TABLES)
-- =========================================================================

-- 6. TÍNH NĂNG 1: Giao dịch lặp định kỳ (Recurring Transactions)
-- Đóng vai trò như một lịch hẹn cấu hình sẵn, hệ thống dựa vào đây tự động sinh giao dịch
CREATE TABLE recurring_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,                                  -- Thuộc về ai
    wallet_id INT NOT NULL,                                -- Thao tác trên ví nào
    budget_category_id INT NULL,                           -- Đút vào / Rút từ hũ nhỏ nào (nếu có)
    type ENUM('income', 'allocate', 'expense') NOT NULL,  -- Loại giao dịch tự động sinh ra
    amount DECIMAL(15, 2) NOT NULL,                       -- Số tiền tự động
    note TEXT,                                             -- Ghi chú mẫu (VD: "Tiền mạng hàng tháng")
    frequency ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL, -- Tần suất lặp
    every_x_day INT NOT NULL DEFAULT 1,                    -- Ngày cụ thể kích hoạt (VD: ngày 5 hàng tháng)
    next_execution_date DATE NOT NULL,                     -- Ngày tiếp theo cần chạy (Dành cho backend check)
    is_active BOOLEAN DEFAULT TRUE,                        -- Trạng thái bật/tắt lịch lặp này
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    FOREIGN KEY (budget_category_id) REFERENCES budget_categories(id) ON DELETE CASCADE
);

-- 7. TÍNH NĂNG 2: Mục tiêu tiết kiệm (Savings Goals)
-- Quản lý tích lũy dài hạn tách biệt với ngân sách tiêu dùng ngắn hạn của tháng
CREATE TABLE savings_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,                            -- Ví dụ: "Quỹ đổi iPhone 18"
    target_amount DECIMAL(15, 2) NOT NULL,                 -- Số tiền mục tiêu
    current_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,  -- Số tiền hiện tại đã tích lũy được
    target_date DATE NULL,                                 -- Hạn định ngày muốn đạt được
    status ENUM('ongoing', 'achieved') DEFAULT 'ongoing',  -- Trạng thái mục tiêu
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. TÍNH NĂNG 3: Đính kèm hóa đơn/Hình ảnh (Attachments)
-- Quan hệ 1-N với `budget_transactions` (Một giao dịch được đính kèm nhiều ảnh)
CREATE TABLE transaction_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,                           -- Liên kết trực tiếp với lịch sử giao dịch
    file_url VARCHAR(255) NOT NULL,                        -- Đường dẫn tới nơi lưu ảnh (S3, Firebase, Cloudinary...)
    file_type VARCHAR(50),                                 -- image/jpeg, image/png, application/pdf
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES budget_transactions(id) ON DELETE CASCADE
);