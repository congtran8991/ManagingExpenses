import type { STORAGE_KEYS } from '@/constants';

// 2. Tạo Type từ StorageKeys để ép kiểu chặt chẽ cho tham số đầu vào
export type TStorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

class StorageEnhance {
  /**
   * Lưu dữ liệu vào localStorage (Tự động chuyển đổi Object/Array thành chuỗi JSON)
   */
  set = (key: TStorageKey, value: any): void => {
    try {
      // 🌟 NẾU LÀ STRING THÌ LƯU THẲNG, KHÔNG STRINGIFY NỮA
      const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error(`[StorageEnhance] Lỗi khi set key "${key}":`, error);
    }
  };

  /**
   * Lấy dữ liệu từ localStorage (Tự động parse chuỗi JSON về dạng Object/Array/Primitive ban đầu)
   * 🛡️ Đã bọc try/catch chống sập ứng dụng nếu dữ liệu lưu trữ bị lỗi định dạng JSON.
   */
  get = <T = any>(key: TStorageKey): T | undefined => {
    const value = localStorage.getItem(key);
    if (!value) return undefined;

    try {
      // 🌟 NẾU LÀ CHUỖI JSON HỢP LỆ THÌ MỚI PARSE, KHÔNG THÌ TRẢ VỀ CHUỖI THUẦN
      if (value.startsWith('{') || value.startsWith('[')) {
        return JSON.parse(value) as T;
      }
      return value as unknown as T;
    } catch (error) {
      console.error(`[StorageEnhance] Lỗi khi parse JSON cho key "${key}":`, error);
      return value as unknown as T;
    }
  };

  /**
   * Xóa một key cụ thể khỏi bộ nhớ
   */
  delete = (key: TStorageKey): void => {
    localStorage.removeItem(key);
  };

  /**
   * Xóa sạch toàn bộ bộ nhớ localStorage của domain này
   */
  clear = (): void => {
    localStorage.clear();
  };
}

// Export một Instance duy nhất (Singleton Pattern) để dùng chung toàn hệ thống
export default new StorageEnhance();
