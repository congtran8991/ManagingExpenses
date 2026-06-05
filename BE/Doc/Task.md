# 📋 DANH SÁCH TASK DỰ ÁN QUẢN LÝ CHI TIÊU CÁ CHÂN

---

## 🛠️ EPIC 1: GIAI ĐOẠN 1 - HỆ THỐNG CỐT LÕI (CORE)

### Task 1.1: Thiết kế và khởi tạo Database ban đầu
* **Mô tả:** Chạy script khởi tạo 5 bảng cốt lõi phục vụ luồng chạy cơ bản: `users`, `wallets`, `budget_periods`, `budget_categories`, `budget_transactions`.
* **To-do list:**
    - [ ] Cài đặt DBMS (MySQL/PostgreSQL).
    - [ ] Chạy file Script SQL tạo bảng và cấu hình các khóa ngoại (`FOREIGN KEY`) với thuộc tính `ON DELETE CASCADE`.
    - [ ] Thêm chỉ mục (`INDEX`) cho các cột `user_id`, `wallet_id`, `period_id` để tối ưu truy vấn sau này.
* **Điều kiện hoàn thành (DoD):** Database được khởi tạo thành công và sơ đồ quan hệ giữa các bảng chính xác.

### Task 1.2: API Đăng ký & Đăng nhập (Authentication)
* **Mô tả:** Xây dựng hệ thống định danh người dùng để bảo mật dữ liệu tài chính.
* **To-do list:**
    - [ ] Viết API `POST /api/v1/auth/register` (Nhận email, username, password).
    - [ ] Tích hợp thư viện mã hóa mật khẩu (`bcrypt`) trước khi lưu `password_hash` vào bảng `users`.
    - [ ] Viết API `POST /api/v1/auth/login` (Xác thực mật khẩu và trả về JWT Token).
    - [ ] Viết Middleware xác thực JWT cho tất cả các API phía sau.
* **Điều kiện hoàn thành (DoD):** Đăng ký được tài khoản, mật khẩu trong DB được mã hóa chuỗi ngẫu nhiên, đăng nhập trả về mã Token hợp lệ.

### Task 1.3: API Quản lý Ví thủ công (`wallets`)
* **Mô tả:** Cho phép người dùng tự khai báo và quản lý các nguồn tiền thực tế của họ.
* **To-do list:**
    - [ ] Viết API `GET /api/v1/wallets` (Lấy danh sách ví của user hiện tại dựa theo token).
    - [ ] Viết API `POST /api/v1/wallets` (Tạo ví mới: Nhận tên ví và số dư ban đầu `balance`).
    - [ ] Viết API `PUT /api/v1/wallets/:id` (Sửa tên ví).
    - [ ] Viết API `DELETE /api/v1/wallets/:id` (Xóa ví).
* **Điều kiện hoàn thành (DoD):** Tạo được ví thủ công thành công, số dư mặc định lưu đúng định dạng thập phân.

### Task 1.4: API Ghi nhận Thu nhập tổng (`type = 'income'`)
* **Mô tả:** Xử lý logic khi người dùng nhận tiền từ ngoài đời nạp vào ví tổng.
* **To-do list:**
    - [ ] Viết API `POST /api/v1/transactions/income`.
    - [ ] Triển khai **Database Transaction**:
        * BƯỚC 1: Insert bản ghi vào bảng `budget_transactions` với `budget_category_id = NULL`.
        * BƯỚC 2: Chạy lệnh cộng tiền: `UPDATE wallets SET balance = balance + amount WHERE id = wallet_id`.
* **Điều kiện hoàn thành (DoD):** Sau khi gọi API thành công, số dư trong bảng `wallets` tăng lên chính xác và có một bản ghi lịch sử tương ứng xuất hiện.

---

## 📅 EPIC 2: GIAI ĐOẠN 2 - LẬP KẾ HOẠCH NGÂN SÁCH (BUDGET)

### Task 2.1: API Quản lý Hũ lớn / Chu kỳ (`budget_periods`)
* **Mô tả:** Khởi tạo khoảng thời gian để gom nhóm các khoản chi tiêu (Ví dụ: Chi tiêu tháng 5).
* **To-do list:**
    - [ ] Viết API `POST /api/v1/periods` (Nhận vào tiêu đề chu kỳ, VD: "Chi tiêu tháng 5/2026").
    - [ ] Viết API `GET /api/v1/periods` (Lấy danh sách các chu kỳ đã lập của user).
* **Điều kiện hoàn thành (DoD):** Tạo được chu kỳ thời gian liên kết đúng với `user_id`.

### Task 2.2: API Quản lý Hũ nhỏ & Phân bổ vốn (`budget_categories` & `type = 'allocate'`)
* **Mô tả:** Tạo hũ nhỏ (mục đích chi tiêu) bên trong hũ lớn và trích tiền từ ví tổng để cấp vốn cho hũ nhỏ đó.
* **To-do list:**
    - [ ] Viết API `POST /api/v1/periods/:periodId/categories` (Tạo hũ nhỏ thuộc hũ lớn).
    - [ ] Triển khai Logic kiểm tra ở Backend: Check xem số dư của `wallet_id` truyền lên có đủ số tiền muốn cấp vốn không. Nếu không đủ, trả về lỗi `400 Bad Request`.
    - [ ] Triển khai **Database Transaction**:
        * BƯỚC 1: Trừ tiền ví tổng (`wallets.balance = balance - amount`).
        * BƯỚC 2: Cộng vốn vào hũ nhỏ (`budget_categories.allocated_amount` và `current_balance` cùng tăng lên bằng số tiền cấp vốn).
        * BƯỚC 3: Ghi nhận lịch sử giao dịch vào bảng `budget_transactions` với `type = 'allocate'`.
* **Điều kiện hoàn thành (DoD):** Khi tạo một hũ nhỏ có số vốn 3 triệu lấy từ Ví tiền mặt: Ví tiền mặt bị trừ đúng 3 triệu, hũ nhỏ có số dư hiện tại là 3 triệu, sinh ra 1 bản ghi lịch sử.

---

## 🛒 EPIC 3: GIAI ĐOẠN 3 - TIÊU TIỀN THỰC TẾ & BÁO CÁO

### Task 3.1: API Ghi nhận Chi tiêu thực tế (`type = 'expense'`)
* **Mô tả:** Người dùng thực hiện rút tiền từ các hũ nhỏ ra để chi xài ngoài đời thực.
* **To-do list:**
    - [ ] Viết API `POST /api/v1/transactions/expense`.
    - [ ] Triển khai **Database Transaction**:
        * BƯỚC 1: Insert bản ghi chi tiêu vào `budget_transactions` (Lưu rõ `wallet_id` nào và `budget_category_id` nào).
        * BƯỚC 2: Trừ tiền ở Hũ nhỏ mục đích (`budget_categories.current_balance = current_balance - amount`). 
    - [ ] Kiểm tra nếu hũ nhỏ bị âm tiền (`current_balance < 0`), đính kèm thêm cờ cảnh báo `"warning": "Over-budget"` trong dữ liệu JSON trả về cho Frontend.
* **Điều kiện hoàn thành (DoD):** Hũ nhỏ bị trừ tiền chính xác, ví tổng không bị trừ thêm lần nữa, hiển thị cảnh báo nếu tiêu quá hạn mức của hũ.

### Task 3.2: API Chuyển quỹ qua lại giữa các hũ nhỏ (`type = 'transfer'`)
* **Mô tả:** Xử lý tính năng cứu trợ, chuyển tiền từ hũ thừa sang hũ thiếu trong cùng một chu kỳ tháng.
* **To-do list:**
    - [ ] Viết API `POST /api/v1/transactions/transfer-category`.
    - [ ] Nhận vào: `from_category_id` (Hũ chuyển đi), `to_category_id` (Hũ nhận tiền), và `amount`.
    - [ ] Kiểm tra số dư của hũ chuyển đi có đủ không.
    - [ ] Triển khai **Database Transaction**:
        * Tạo bản ghi 1: Loại `expense` ở hũ chuyển đi.
        * Tạo bản ghi 2: Loại `allocate` ở hũ nhận tiền.
        * Cập nhật số dư `current_balance` của cả 2 hũ tương ứng.
* **Điều kiện hoàn thành (DoD):** Tiền dịch chuyển mượt mà giữa hai hũ, tổng tài sản của user không thay đổi.

### Task 3.3: API Tổng hợp dữ liệu làm Biểu đồ (Dashboard Analytics)
* **Mô tả:** Tính toán số liệu phần trăm tiêu dùng để frontend vẽ biểu đồ báo cáo.
* **To-do list:**
    - [ ] Viết API `GET /api/v1/reports/periods/:periodId`.
    - [ ] Viết câu lệnh SQL sử dụng các hàm tính toán để lấy ra: Tên hũ, Số vốn ban đầu, Số dư còn lại, Số tiền đã tiêu, và Tỷ lệ phần trăm đã tiêu.
* **Điều kiện hoàn thành (DoD):** API trả về một mảng JSON chứa đầy đủ các thông số tính toán chính xác để làm biểu đồ tiến độ.

---

## 🚀 EPIC 4: GIAI ĐOẠN 4 - TÍNH NĂNG MỞ RỘNG (ADVANCED)

### Task 4.1: Tích hợp Upload ảnh hóa đơn (`transaction_attachments`)
* **Mô tả:** Cho phép đính kèm ảnh chụp hóa đơn mua hàng vào lịch sử giao dịch.
* **To-do list:**
    - [ ] Cấu hình một dịch vụ lưu trữ đám mây (Cloudinary / Firebase Storage / AWS S3) ở Backend.
    - [ ] Viết Middleware xử lý nhận file từ Frontend (Dùng thư viện `multer` nếu dùng Node.js).
    - [ ] Sửa lại API tạo giao dịch: Sau khi tạo xong giao dịch, lấy link ảnh trả về từ Cloud lưu vào bảng `transaction_attachments` kết nối qua `transaction_id`.
* **Điều kiện hoàn thành (DoD):** Giao dịch hiển thị kèm theo mảng danh sách URL hình ảnh.

### Task 4.2: Thiết lập Quỹ tiết kiệm dài hạn (`savings_goals`)
* **Mô tả:** Giúp user tích lũy tiền cho mục tiêu lớn (Mua xe, mua nhà) tách biệt với ngân sách tiêu dùng tháng.
* **To-do list:**
    - [ ] Viết API `POST /api/v1/savings-goals` (Tạo mục tiêu mới: Tên mục tiêu, Số tiền cần đạt, Ngày mong muốn hoàn thành).
    - [ ] Viết API `POST /api/v1/savings-goals/:id/deposit` (Bỏ tiền tiết kiệm vào quỹ):
        * Trừ tiền ví tổng: `UPDATE wallets SET balance = balance - amount`.
        * Cộng tiền vào quỹ: `UPDATE savings_goals SET current_amount = current_amount + amount`.
* **Điều kiện hoàn thành (DoD):** Quỹ tiết kiệm tăng tiền, Ví tổng giảm tiền, mục tiêu tự động chuyển trạng thái sang `achieved` khi số tiền tích lũy bằng hoặc vượt mức mục tiêu.

### Task 4.3: Viết Cron Job tự động sinh giao dịch định kỳ (`recurring_templates`)
* **Mô tả:** Hệ thống tự động sinh các giao dịch cố định hàng tháng (Tiền nhà, tiền lương) khi đến ngày hẹn.
* **To-do list:**
    - [ ] Cài đặt thư viện chạy ngầm (VD: `node-cron`). Cấu hình cho hàm chạy vào lúc `00:00` hàng ngày.
    - [ ] Code logic cho Cron Job:
        * Tìm kiếm các bản ghi thỏa mãn điều kiện: `is_active = true` VÀ `next_execution_date = Hôm nay`.
        * Lặp qua từng bản ghi: Tự động chạy lệnh Insert giao dịch và cộng/trừ tiền ví/hũ tương ứng giống như thao tác tay của user.
        * Tính toán ngày thực thi tiếp theo dựa vào trường `frequency` và tiến hành `UPDATE` lại cột `next_execution_date`.
* **Điều kiện hoàn thành (DoD):** Khi đổi ngày hệ thống thử nghiệm trùng với ngày hẹn, giao dịch tự động phát sinh trong DB mà không cần bấm nút trên giao diện.