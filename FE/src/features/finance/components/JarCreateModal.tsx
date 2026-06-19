// src/features/finance/components/JarCreateModal.tsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/apis/financeApi';
import { QUERY_KEYS } from '@/constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/common/ui/Dialog"; // Hoặc import từ /ui/dialog tùy dự án của bạn
import { Button } from "@/components/common/ui/Button";
import { Input } from "@/components/common/ui/Input";

interface JarCreateModalProps {
    periodId: number;
}

export const JarCreateModal: React.FC<JarCreateModalProps> = ({ periodId }) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [allocatedAmount, setAllocatedAmount] = useState('');
    const queryClient = useQueryClient();

    const createJarMutation = useMutation({
        // Giả lập endpoint tạo hũ nhỏ dựa trên cấu trúc API của bạn
        mutationFn: (data: { name: string; allocated_amount: number }) =>
            financeApi.allocateFund(periodId, {
                wallet_id: 0, // Giá trị mặc định hoặc tùy biến theo Backend xử lý khởi tạo
                budget_category_id: 0,
                amount: data.allocated_amount,
                note: `Khởi tạo hũ ${data.name}`
            }),
        onSuccess: () => {
            // Làm mới danh sách hũ nhỏ của chu kỳ này trên UI
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JARS, periodId] });
            setOpen(false);
            setName('');
            setAllocatedAmount('');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !allocatedAmount) return;

        createJarMutation.mutate({
            name,
            allocated_amount: Number(allocatedAmount)
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                    + Thêm hũ nhỏ mới
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Tạo hũ ngân sách nhỏ mới</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1">
                        <label className="text-xs font-medium">Tên hũ chi tiêu</label>
                        <Input
                            type="text"
                            placeholder="Ví dụ: Tiền ăn uống, Tiền xăng xe, Mua sắm"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium">Hạn mức cấp vốn (VND)</label>
                        <Input
                            type="number"
                            placeholder="Ví dụ: 3000000"
                            value={allocatedAmount}
                            onChange={e => setAllocatedAmount(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={createJarMutation.isPending}>
                        {createJarMutation.isPending ? 'Đang tạo hũ...' : 'Xác nhận tạo'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};