import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/common/ui/Button';

export const Route = createFileRoute('/')({
  component: () => (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-3 p-4 text-center">
      <h1 className="text-3xl font-extrabold tracking-tight">Két Sắt Ngân Sách Thông Minh</h1>
      <Link to="/login">
        <Button>Truy cập ứng dụng</Button>
      </Link>
    </div>
  ),
});
