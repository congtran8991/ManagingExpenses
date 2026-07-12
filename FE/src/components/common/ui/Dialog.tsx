import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  // Truyền trạng thái open và hàm onOpenChange xuống cho các component con thông qua React Context hoặc pass props trực tiếp
  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // Nếu là Trigger, truyền hàm mở Modal xuống
          if (child.type === DialogTrigger) {
            return React.cloneElement(child as React.ReactElement<any>, {
              onClick: () => onOpenChange(true),
            });
          }
          // Nếu là Content, chỉ hiển thị khi trạng thái open = true
          if (child.type === DialogContent) {
            if (!open) return null;
            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Lớp nền mờ (Overlay) phía sau */}
                <div
                  className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
                  onClick={() => onOpenChange(false)}
                />
                {child}
              </div>
            );
          }
        }
        return child;
      })}
    </>
  );
};

// FIX LỖI TẠI ĐÂY: DialogTrigger bốc hàm onClick nhận từ Dialog cha và truyền trực tiếp vào thẻ con (Button)
export const DialogTrigger: React.FC<{
  asChild?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ children, onClick }) => {
  if (React.isValidElement(children)) {
    // Khai báo một biến tạm được ép kiểu về React.ReactElement<any> để TypeScript cho phép đọc thuộc tính .props
    const element = children as React.ReactElement<any>;

    return React.cloneElement(element, {
      onClick: (e: React.MouseEvent) => {
        // Kiểm tra xem nút bấm con có hàm onClick riêng không, nếu có thì chạy trước
        if (element.props && typeof element.props.onClick === 'function') {
          element.props.onClick(e);
        }
        // Sau đó chạy hàm mở Dialog của cha
        if (onClick) onClick();
      },
    });
  }

  // Trường hợp children truyền vào là chuỗi text thuần, tự động bọc thẻ button mặc định
  return (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  );
};

export const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={twMerge(
        clsx(
          'relative z-50 grid w-full max-w-sm gap-4 border border-slate-200 bg-white p-6 shadow-xl rounded-xl text-slate-900',
          className
        )
      )}
      {...props}
    >
      {/* Thêm nút X đóng nhanh góc phải cho đúng chuẩn UX */}
      {children}
    </div>
  )
);
DialogContent.displayName = 'DialogContent';

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={twMerge(clsx('flex flex-col space-y-1.5 text-left', className))} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

export const DialogTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={twMerge(
      clsx('text-lg font-bold leading-none tracking-tight text-slate-900', className)
    )}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';
