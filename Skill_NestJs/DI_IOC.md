# Cẩm Nang Toàn Diện: Tìm Hiểu Bản Chất IoC Và DI Trong Kiến Trúc Phần Mềm

Khi xây dựng các hệ thống Backend quy mô lớn (Scalable) bằng các Framework hiện đại như NestJS, Spring Boot, hay .NET Core, hai khái niệm **IoC (Inversion of Control)** và **DI (Dependency Injection)** chính là chiếc chìa khóa vàng giúp mã nguồn luôn sạch sẽ, linh hoạt và dễ bảo trì.

Tài liệu này sẽ mổ xẻ chi tiết từ định nghĩa, cách tiếp cận cho đến cơ chế vận hành thực tế đằng sau hậu trường của hai khái niệm này.

---

## 1. Tổng Quan Về IoC (Inversion of Control) - Đảo Ngược Điều Khiển

### 1.1. IoC Là Gì?

**IoC (Inversion of Control - Đảo ngược điều khiển)** không phải là một thư viện, cũng không phải một đoạn code cụ thể. Nó là một **Triết lý / Nguyên lý thiết kế phần mềm** (Design Principle).

- **Trong lập trình truyền thống:** Luồng thực thi của ứng dụng do lập trình viên hoàn toàn kiểm soát. Bạn tự quyết định khi nào thì tạo ra đối tượng, khi nào gọi hàm, và tự chịu trách nhiệm kết nối các thành phần lại với nhau.
- **Trong kiến trúc IoC:** Quyền kiểm soát luồng chạy và quản lý vòng đời của các đối tượng được **chuyển giao hoàn toàn cho Framework** (hoặc một bộ máy quản lý ngầm). Bạn không còn là người chủ động tạo ra đối tượng nữa, bạn chỉ là người "khai báo" cấu trúc.

### 1.2. Cách Tiếp Cận Của IoC

Để đạt được triết lý IoC, thế giới lập trình có rất nhiều cách tiếp cận khác nhau:

1. **Dependency Injection (DI):** Tiêm phụ thuộc (Cách phổ biến nhất, được NestJS sử dụng).
2. **Service Locator Pattern:** Một trung tâm đăng ký dịch vụ, nơi các class chủ động chạy đến để "xin" thực thể cần thiết.
3. **Template Method Pattern:** Định nghĩa sẵn một bộ khung thuật toán trong class cha, cho phép class con ghi đè (override) các bước cụ thể mà không làm thay đổi cấu trúc luồng chạy chung.

---

## 2. Tổng Quan Về DI (Dependency Injection) - Tiêm Phụ Thuộc

### 2.1. DI Là Gì?

Nếu IoC là một ý tưởng vĩ mô, thì **DI (Dependency Injection)** chính là **Giải pháp / Mẫu thiết kế** (Design Pattern) cụ thể và thực chiến nhất để hiện thực hóa ý tưởng đó.

- **Dependency (Sự phụ thuộc):** Nếu `Class A` muốn hoạt động thì bên trong bắt buộc phải gọi tới các hàm của `Class B`. Lúc này, `Class B` được gọi là một _Dependency_ (sự phụ thuộc) của `Class A`.
- **Injection (Sự tiêm):** Thay vì `Class A` phải tự bỏ công sức ra để khởi tạo `Class B` (bằng từ khóa `new`), một thế lực bên ngoài (Framework) sẽ tự động tạo ra `Class B` và "bắn" (tiêm) thực thể đó vào thẳng bên trong `Class A`.

### 2.2. Các Cách Tiếp Cận (Các Dạng Tiêm) Của DI

Trong lập trình, có 3 con đường phổ biến để "tiêm" một phụ thuộc vào trong một Class:

#### Dạng 1: Constructor Injection (Tiêm qua hàm khởi tạo) — _Khuyên dùng tối đa_

Đây là cách NestJS sử dụng mặc định. Các phụ thuộc được nạp vào ngay khi đối tượng được khai sinh.

```typescript
@Injectable()
export class AuthService {
  // Tiêm thẳng JwtService vào qua Constructor
  constructor(private readonly jwtService: JwtService) {}
}
```
