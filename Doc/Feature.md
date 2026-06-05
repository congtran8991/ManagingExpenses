# 📄 TÀI LIỆU KỊCH BẢN TÍCH HỢP HỆ THỐNG (SYSTEM INTEGRATION DOCUMENT)

---

## 🛠️ PHẦN 1: EPIC 1 - HỆ THỐNG CỐT LÕI (CORE SYSTEM)

### 1. Tính năng: Đăng ký & Xác thực Người dùng
* **Mã Task liên quan:** `Task 1.2`
* **Mục đích thực tế:** * **Nỗi đau của người dùng:** Dữ liệu tài chính, thu nhập, chi tiêu là thông tin cực kỳ nhạy cảm và riêng tư. Không ai muốn người khác mở app lên là thấy mình có bao nhiêu tiền hay tháng này đã tiêu vào những việc gì.
    * **Giải pháp thực tế:** Bảo mật tuyệt đối dữ liệu cá nhân. Phân tách không gian lưu trữ để hàng triệu người có thể dùng chung một hệ thống nhưng dữ liệu hoàn toàn độc lập, không bị rò rỉ hay chồng chéo chéo lên nhau.
* **Chi tiết xử lý tại Backend:**
    * **Endpoint:** `POST /api/v1/auth/register`
    * **Dữ liệu nhận (Body):**
        ```json
        {
          "username": "user_A",
          "email": "userA@email.com",
          "password": "mySecurePassword123"
        }
        ```
    * **Logic xử lý:** 1. Gọi hàm `bcrypt.hash(password, saltRounds)` để biến đổi chuỗi mật khẩu thô thành chuỗi băm bảo mật.
        2. Chèn dữ liệu mới vào bảng `users`. Tuyệt đối không lưu mật khẩu chưa mã hóa.
        ```sql
        INSERT INTO users (username, email, password_hash) 
        VALUES ('user_A', 'userA@email.com', '$2b$10$X...');
        ```

### 2. Tính năng: Tạo Ví thủ công và Nạp tiền (Thu nhập tổng)
* **Mã Task liên quan:** `Task 1.3`, `Task 1.4`
* **Mục đích thực tế:** * **Nỗi đau của người dùng:** Tiền của một người thường phân tán ở nhiều nơi (tiền mặt trong túi, thẻ ngân hàng Techcombank, ví Momo...). Nếu không gom về một chỗ, họ sẽ không biết tổng tài sản thực tế của mình là bao nhiêu và rất khó kiểm soát tiền đi đâu về đâu.
    * **Giải pháp thực tế:** Phản ánh chính xác 100% "Tổng tài sản" hiện có của người dùng tại một thời điểm. Việc nhập thủ công giúp họ linh hoạt kiểm soát số dư mà không cần liên kết ngân hàng (tránh sợ lộ thông tin tài khoản). Nó là bước đầu tiên để ghi nhận "Dòng tiền vào" (Income) trước khi đem đi phân bổ.
* **Chi tiết xử lý tại Backend:**
    * **Endpoint:** `POST /api/v1/transactions/income`
    * **Dữ liệu nhận (Body):**
        ```json
        {
          "wallet_id": 1,
          "period_id": 1,
          "amount": 15000000.00,
          "note": "Nhận lương tháng 5"
        }
        ```
    * **Logic xử lý (Bắt buộc dùng Database Transaction):**
        ```sql
        START TRANSACTION;
        
        -- 1. Ghi nhận nhật ký thu nhập (budget_category_id để NULL vì chưa chia vào hũ)
        INSERT INTO budget_transactions (wallet_id, period_id, budget_category_id, type, amount, note)
        VALUES (1, 1, NULL, 'income', 15000000.00, 'Nhận lương tháng 5');
        
        -- 2. Cộng tiền trực tiếp vào Ví tổng ngoài đời của User
        UPDATE wallets 
        SET balance = balance + 15000000.00 
        WHERE id = 1;
        
        COMMIT;
        ```

---

## 📅 PHẦN 2: EPIC 2 - LẬP KẾ HOẠCH & PHÂN BỔ NGÂN SÁCH (BUDGET)

### 1. Tính năng: Cấp vốn ban đầu cho Hũ nhỏ từ Ví tổng
* **Mã Task liên quan:** `Task 2.2`
* **Mục đích thực tế:** * **Nỗi đau của người dùng:** "Đầu tháng nhận lương, giữa tháng hết tiền" là tình trạng chung do thói quen thấy ví còn nhiều tiền là tiêu vô tội vạ. Người dùng không có kế hoạch giới hạn cho từng mục đích cụ thể.
    * **Giải pháp thực tế:** Áp dụng phương pháp "6 chiếc hũ tài chính" hoặc "chia tiền vào phong bì". Bằng cách trích sẵn tiền ví tổng bỏ vào các hũ nhỏ (VD: Cất riêng 3 triệu nuôi con, 2 triệu tiền ăn), số tiền còn lại trong ví mới là số tiền thực tế được tiêu xài tự do. Tính năng này ép người dùng vào kỷ luật tài chính ngay từ đầu chu kỳ.
* **Chi tiết xử lý tại Backend:**
    * **Endpoint:** `POST /api/v1/periods/:periodId/categories`
    * **Dữ liệu nhận (Body):**
        ```json
        {
          "wallet_id": 1,
          "budget_category_id": 5, 
          "amount": 3000000.00,
          "note": "Cấp vốn hũ nuôi con tháng 5"
        }
        ```
    * **Logic xử lý và Ràng buộc dữ liệu (Validation):**
        1. **Kiểm tra (Check):** Gọi câu lệnh `SELECT balance FROM wallets WHERE id = 1`. Kiểm tra nếu số dư nhỏ hơn `3000000.00`, lập tức dừng luồng và trả về mã lỗi `400 Bad Request` kèm thông báo `"Ví không đủ tiền để phân bổ ngân sách"`.
        2. **Chạy Transaction (Nếu đủ tiền):**
        ```sql
        START TRANSACTION;
        
        -- 1. Tạo lịch sử phân bổ vốn
        INSERT INTO budget_transactions (wallet_id, period_id, budget_category_id, type, amount, note)
        VALUES (1, 1, 5, 'allocate', 3000000.00, 'Cấp vốn hũ nuôi con tháng 5');
        
        -- 2. Trừ tiền ở Ví tổng (Vì số tiền này đã mang đi cất vào két hũ)
        UPDATE wallets 
        SET balance = balance - 3000000.00 
        WHERE id = 1;
        
        -- 3. Cập nhật đồng thời Số vốn ban đầu và Số dư hiện tại của Hũ nhỏ
        UPDATE budget_categories 
        SET allocated_amount = allocated_amount + 3000000.00,
            current_balance = current_balance + 3000000.00
        WHERE id = 5;
        
        COMMIT;
        ```

---

## 🛒 PHẦN 3: EPIC 3 - CHI TIÊU THỰC TẾ & BÁO CÁO (TRACKING)

### 1. Tính năng: Ghi nhận Chi tiêu từ Hũ nhỏ
* **Mã Task liên quan:** `Task 3.1`
* **Mục đích thực tế:** * **Nỗi đau của người dùng:** Cuối tháng nhìn lại ví trống rỗng nhưng không nhớ nổi mình đã tiêu những gì, tiêu vào đâu mà hết tiền nhanh thế.
    * **Giải pháp thực tế:** Đóng vai trò là "cuốn sổ nhật ký tự động". Mỗi lần người dùng tiêu tiền, app sẽ ngay lập tức tính toán: "Bạn vừa tiêu 500k, hũ này chỉ còn 2.5 triệu". Việc thấy số dư hũ giảm dần trực quan sẽ tạo ra một áp lực tâm lý tích cực, giúp người dùng tự động "phanh" lại khi thấy hũ đó sắp cạn kiệt.
* **Chi tiết xử lý tại Backend:**
    * **Endpoint:** `POST /api/v1/transactions/expense`
    * **Dữ liệu nhận (Body):**
        ```json
        {
          "wallet_id": 1,
          "period_id": 1,
          "budget_category_id": 5,
          "amount": 500000.00,
          "note": "Mua bỉm tã cho con"
        }
        ```
    * **Logic xử lý kỹ thuật:**
        ```sql
        START TRANSACTION;
        
        -- 1. Lưu vết lịch sử chi tiêu thực tế
        INSERT INTO budget_transactions (wallet_id, period_id, budget_category_id, type, amount, note)
        VALUES (1, 1, 5, 'expense', 500000.00, 'Mua bỉm tã cho con');
        
        -- 2. Chỉ trừ tiền ở Số dư hiện tại của Hũ nhỏ, ví tổng KHÔNG đổi
        UPDATE budget_categories 
        SET current_balance = current_balance - 500000.00
        WHERE id = 5;
        
        COMMIT;
        ```
    * **Xử lý Logic nâng cao (Cảnh báo vượt hạn mức):** Sau khi `COMMIT`, chạy lệnh kiểm tra nếu `current_balance < 0`, Backend gửi trả về phản hồi JSON kèm thông tin cảnh báo:
        ```json
        {
          "status": "success",
          "message": "Giao dịch đã được lưu",
          "warning": "Over-budget",
          "remaining_balance": -50000.00
        }
        ```

### 2. Tính năng: Chuyển quỹ cứu trợ giữa các Hũ nhỏ (`transfer`)
* **Mã Task liên quan:** `Task 3.2`
* **Mục đích thực tế:** * **Nỗi đau của người dùng:** Lập kế hoạch đầu tháng chỉ mang tính lý thuyết, cuộc sống thực tế luôn phát sinh biến số (Ví dụ: Tháng này con bị ốm nên hũ "Chi cho con" bị thiếu hụt nghiêm trọng, trong khi hũ "Mua sắm quần áo" lại không dùng hết). Nếu app quá cứng nhắc không cho chuyển tiền qua lại, người dùng sẽ bỏ app.
    * **Giải pháp thực tế:** Tăng tính linh hoạt và thực tế cho mô hình quản lý. Thay vì phải làm các bước thủ công phức tạp (Rút tiền từ hũ A trả về ví tổng -> Lấy tiền ví tổng nạp vào hũ B), tính năng chuyển quỹ cho phép "cứu trợ" trực tiếp giữa các danh mục, tối ưu hóa dòng tiền mà vẫn giữ nguyên tổng tài sản.
* **Chi tiết xử lý tại Backend:**
    * **Endpoint:** `POST /api/v1/transactions/transfer-category`
    * **Dữ liệu nhận (Body):**
        ```json
        {
          "wallet_id": 1,
          "period_id": 1,
          "from_category_id": 6, 
          "to_category_id": 5,   
          "amount": 500000.00
        }
        ```
    * **Logic xử lý hệ thống:**
        ```sql
        START TRANSACTION;
        
        -- 1. Tạo giao dịch rút tiền từ hũ đi chơi
        INSERT INTO budget_transactions (wallet_id, period_id, budget_category_id, type, amount, note)
        VALUES (1, 1, 6, 'expense', 500000.00, 'Trích quỹ đi chơi chuyển sang cứu trợ hũ con cái');
        
        -- 2. Tạo giao dịch nạp tiền vào hũ chi cho con
        INSERT INTO budget_transactions (wallet_id, period_id, budget_category_id, type, amount, note)
        VALUES (1, 1, 5, 'allocate', 500000.00, 'Nhận tiền cứu trợ từ hũ đi chơi');
        
        -- 3. Cập nhật trừ tiền hũ đi chơi
        UPDATE budget_categories SET current_balance = current_balance - 500000.00 WHERE id = 6;
        
        -- 4. Cập nhật cộng tiền hũ chi cho con
        UPDATE budget_categories SET current_balance = current_balance + 500000.00 WHERE id = 5;
        
        COMMIT;
        ```

---

## 🚀 PHẦN 4: EPIC 4 - TÍNH NĂNG NÂNG CAO TRONG THỰC TẾ (ADVANCED)

### 1. Tính năng: Giao dịch tự động định kỳ (`recurring_templates`)
* **Mã Task liên quan:** `Task 4.3`
* **Mục đích thực tế:** * **Nỗi đau của người dùng:** Người dùng rất lười nhập liệu. Những khoản chi cố định tháng nào cũng lặp lại giống hệt nhau (Tiền đóng thô mạng Internet ngày 5, tiền thuê nhà ngày 10, tiền điện ngày 15...) nếu cứ bắt họ tháng nào cũng mở app gõ tay thì họ sẽ cảm thấy phiền và lười dần dẫn đến bỏ thói quen ghi chép.
    * **Giải pháp thực tế:** Tự động hóa trải nghiệm người dùng (Automation UX). Hệ thống tự động chạy ngầm để sinh giao dịch, giúp app trở nên thông minh, "hiểu" thói quen sinh hoạt của chủ nhân và đảm bảo dữ liệu dòng tiền luôn chính xác, liên tục ngay cả khi người dùng quên mở app.
* **Chi tiết xử lý tại Backend (Hệ thống chạy ngầm Cron Job lúc 00:00 hàng ngày):**
    1. **Bước 1: Quét tìm lịch hẹn đến ngày thi hành:**
        ```sql
        SELECT id, wallet_id, budget_category_id, type, amount, note, frequency, next_execution_date 
        FROM recurring_templates 
        WHERE is_active = TRUE AND next_execution_date = CURDATE();
        ```
    2. **Bước 2: Chạy vòng lặp (Loop) xử lý tự động cho các bản ghi tìm thấy:**
        ```sql
        START TRANSACTION;
        -- Hệ thống tự sinh lịch sử giao dịch (period_id được backend tự động tính toán theo tháng hiện tại)
        INSERT INTO budget_transactions (wallet_id, period_id, budget_category_id, type, amount, note)
        VALUES (wallet_id, current_period_id, 3, 'expense', 4000000.00, 'Hệ thống tự động: Tiền nhà cố định');
        
        -- Hệ thống tự trừ tiền hũ nhỏ
        UPDATE budget_categories SET current_balance = current_balance - 4000000.00 WHERE id = 3;
        COMMIT;
        ```
    3. **Bước 3: Tái thiết lập ngày hẹn cho chu kỳ tiếp theo:**
        ```sql
        UPDATE recurring_templates 
        SET next_execution_date = DATE_ADD(next_execution_date, INTERVAL 1 MONTH) 
        WHERE id = [ID_MAU_DINH_KY];
        ```

---

## 💡 Hướng dẫn kiểm thử thủ công nhanh (Postman Checklist for Dev)
Trước khi làm giao diện, bạn hãy dùng Postman gọi chuỗi API này theo đúng trình tự để kiểm tra tính toàn vẹn của logic:
1. Gọi API `register` để tạo user mới.
2. Gọi API tạo ví `wallets` với số dư là `10,000,000`.
3. Gọi API tạo chu kỳ `periods` (Tháng 5).
4. Gọi API tạo hũ nhỏ `categories` và cấp vốn `3,000,000`. 
    * *Kiểm tra trong DB:* Số dư ví tổng phải tụt xuống còn `7,000,000`. Số dư hũ nhỏ phải bằng `3,000,000`.
5. Gọi API tạo chi tiêu `expense` với số tiền `500,000` từ hũ nhỏ đó.
    * *Kiểm tra trong DB:* Số dư ví tổng phải giữ nguyên `7,000,000`. Số dư hũ nhỏ phải giảm xuống còn `2,500,000`.