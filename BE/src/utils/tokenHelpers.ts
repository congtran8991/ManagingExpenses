import jwt from 'jsonwebtoken';

// Đọc mã bí mật từ file .env ra để sử dụng
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'fallback_access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret';

/**
 * Hàm sinh cặp song sinh Token cho một người dùng
 * @param user Đối tượng người dùng chứa id và username
 */
export const generateTokens = (user: { id: number; username: string }) => {
  // 1. Tạo Access Token (Sống ngắn hạn - 15 phút)
  const accessToken = jwt.sign({ id: user.id, username: user.username }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

  // 2. Tạo Refresh Token (Sống dài hạn - 7 ngày)
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};
