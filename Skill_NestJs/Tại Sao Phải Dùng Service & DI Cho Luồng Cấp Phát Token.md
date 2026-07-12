# Kiến Trúc NestJS: Tại Sao Phải Dùng Service & DI Cho Luồng Cấp Phát Token?

Tài liệu này giải thích chi tiết về mặt kiến trúc hệ thống, cơ chế biên dịch (`npm run build`) và lý do tại sao các hàm nghiệp vụ như `generateTokens` và `refreshTokens` **bắt buộc** phải được viết trong `Service` kết hợp với Decorator `@Injectable()`, thay vì vứt vào thư mục `utils`.

---

## 1. Bản Chất Của Quá Trình `npm run build` Trong NestJS

Khi bạn chạy lệnh `npm run build` (hoặc `nest build`), NestJS và Compiler (`tsc` hoặc `swc`) sẽ thực hiện một cuộc chuyển đổi mã nguồn lớn:

1. **Biên dịch (Compile):** Chuyển đổi toàn bộ file mã nguồn TypeScript (`.ts`) trong thư mục `src/` thành JavaScript thuần (`.js`) trong thư mục `dist/`.
2. **Xóa bỏ Type (Type Erasure):** Toàn bộ các định nghĩa kiểu dữ liệu như `Interface`, `Type` của TypeScript sẽ bị **xóa sạch hoàn toàn**. Trình chạy Node.js ở môi trường Production thực tế không hề biết khái niệm Type là gì.
3. **Giữ lại Metadata nhờ Decorator:** Các decorator như `@Injectable()`, `@Controller()` kết hợp với kiểu dữ liệu khai báo ở Constructor sẽ được dịch thành các **Metadata** (dữ liệu mô tả) thông qua thư viện `reflect-metadata`.

---

## 2. Bản Đồ Linh Kiện (IoC Container) Hoạt Động Như Thế Nào?

Khi ứng dụng khởi động từ thư mục `dist/` (`node dist/main.js`), NestJS sẽ đọc các Metadata được sinh ra từ quá trình build để dựng lên một **IoC Container** (Bộ quản lý đảo ngược điều khiển).

- **Khi có `@Injectable()`:** Compiler hiểu rằng lớp này là một "linh kiện" cần được NestJS quản lý vòng đời.
- **Cơ chế Tiêm Phụ Thuộc (Dependency Injection):** NestJS tự động quét qua Constructor của Service, xem nó cần những thư viện gì (Ví dụ: `JwtService`, `PrismaService`), tự khởi tạo các instance đó dưới dạng **Singleton** (chỉ tạo 1 lần trong bộ nhớ) rồi nạp thẳng vào Service cho bạn.

---

## 3. Tại Sao Luồng Token Phải Nằm Trong Service Thay Vì `utils`?

Việc cố tình đưa các hàm xử lý token nặng nghiệp vụ vào một file tĩnh như `src/common/utils/auth.util.ts` sẽ khiến hệ thống gặp các lỗi chí mạng sau khi build lên Production:

### Lỗi 1: Không thể tương tác với Cơ sở dữ liệu (Database) hoặc Thư viện Framework

- **Luồng thực tế:** Hàm `refreshTokens` bắt buộc phải kết nối Database (Prisma) hoặc Cache (Redis) để kiểm tra xem Token đó có bị thu hồi (Revoke/Banned) hay không.
- **Hệ quả ở `utils`:** File trong `utils` là file tĩnh, không tham gia vào hệ thống DI của NestJS nên **không thể tiêm `PrismaService` hay `JwtService` vào được**. Bạn sẽ phải tự dùng từ khóa `new PrismaService()`, dẫn đến việc tạo vô tội vạ kết nối, gây tràn bộ nhớ (Memory Leak) và crash sập Database.

### Lỗi 2: Trống / Lỗi Biến Môi Trường (`.env`)

- **Hệ quả ở `utils`:** File utils đọc trực tiếp từ `process.env.SECRET`. Khi build ra thư mục `dist/`, nếu file `.env` không nằm đúng cấu trúc thư mục tại thời điểm chạy, biến sẽ bị `undefined`.
- **Giải pháp ở `Service`:** Bạn tiêm `ConfigService` thông qua DI. NestJS đảm bảo `ConfigService` nạp và giữ chặt các giá trị `.env` trong bộ nhớ từ lúc khởi động app. Bạn gọi `this.configService.get(...)` luôn luôn an toàn 100%.

### Lỗi 3: Lỗi Xung Đột Vòng Lặp (Circular Dependency) Lúc Vận Hành

- **Hệ quả ở `utils`:** Nếu file `auth.util.ts` gọi `user.util.ts` và ngược lại, Node.js thuần khi chạy file JS sau khi build sẽ dính lỗi xung đột vòng lặp. Một trong hai function sẽ bị `undefined` lập tức mà compiler không cảnh báo trước.
- **Giải pháp ở `Service`:** NestJS IoC Container quản lý tập trung và điều phối vòng đời khởi tạo của các Service. Nếu có xung đột, NestJS sẽ quăng cảnh báo trực quan lúc khởi động hoặc cung cấp cơ chế giải quyết triệt để (`forwardRef()`).

---

## 🎯 Quy Tắc Phân Chia Thiết Kế (Rule of Thumb)

Để giữ cho mã nguồn luôn Scalable (Dễ mở rộng), Dễ viết Unit Test và Vận hành trơn tru sau khi build:

| Loại thành phần           | Vị trí đặt code          | Đặc điểm nhận diện                                                                                                                                                                              |
| :------------------------ | :----------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pure Function (Utils)** | `src/common/utils/`      | Các hàm thuật toán thuần túy (Cắt chuỗi, định dạng ngày tháng, định dạng tiền tệ). **Đầu vào giống nhau ➡️ Đầu ra giống nhau**, hoàn toàn không phụ thuộc vào Database hay Thư viện bên thứ ba. |
| **Stateful Service**      | `src/modules/<feature>/` | Các hàm xử lý nghiệp vụ (`generateTokens`, `refreshTokens`, `login`). **Bắt buộc phải dùng `@Injectable()`**, tiêm các dependency qua Constructor để NestJS quản lý an toàn tuyệt đối.          |

---

_Tài liệu này được biên soạn nhằm chuẩn hóa tư duy kiến trúc cho toàn bộ đội ngũ phát triển Backend._
