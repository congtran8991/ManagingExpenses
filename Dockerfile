# ==========================================
# STAGE 1: Build ứng dụng
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./

# Sao chép thêm thư mục prisma (chứa file schema.prisma) vào trước khi cài đặt
# Điều này giúp Prisma tự động generate client chuẩn trong quá trình install/postinstall
COPY prisma ./prisma/

RUN yarn install --frozen-lockfile

# Sao chép toàn bộ mã nguồn còn lại
COPY . .

# 🔥 BƯỚC QUAN TRỌNG: Khởi tạo Prisma Client để tạo ra các Types (như Prisma.UserCreateInput)
RUN yarn prisma generate

# Build ứng dụng NestJS
RUN yarn build

# Xóa devDependencies nhưng PHẢI giữ lại Prisma Client trong Production
RUN yarn install --production=true --frozen-lockfile

# 🔥 BƯỚC QUAN TRỌNG 2: Chạy lại generate cho môi trường Production (vì lệnh trên vừa xóa/sắp xếp lại node_modules)
RUN yarn prisma generate

# ==========================================
# STAGE 2: Chạy ứng dụng (Production)
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Copy package, node_modules (đã có Prisma Client được generate) và dist
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/yarn.lock ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
# Copy thêm folder prisma sang stage 2 phòng trường hợp bạn muốn chạy migration lúc start-up
COPY --from=builder /usr/src/app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/src/main.js"]