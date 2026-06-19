import { MobileNavigation } from '@/components/common/navigation/MobileNavigation'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

const RootLayout = () => (
    <>
        <Outlet />
        <MobileNavigation />
        <TanStackRouterDevtools />
    </>
)

export const Route = createRootRoute({ component: RootLayout })