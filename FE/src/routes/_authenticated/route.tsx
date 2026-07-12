import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuthStoreBase } from '@/features/auth';
import { checkAuthOnReload } from '@/utils/checkAuth';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const userInRam = useAuthStoreBase.getState().user;

    console.log(userInRam, 'userInRam');

    if (!userInRam) {
      const isAuthenticated = await checkAuthOnReload();

      // Nếu hàm verify trả về false -> Đá văng ra màn Login lập tức
      if (!isAuthenticated) {
        // throw redirect({
        //   to: '/login',
        //   search: {
        //     // Lưu lại đường dẫn hiện tại để sau khi login xong tự động quay lại trang này
        //     redirect: window.location.pathname,
        //   },
        // });
      }
    }
  },
  component: () => (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  ),
});
