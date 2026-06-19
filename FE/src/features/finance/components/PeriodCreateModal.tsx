// src/features/finance/components/PeriodCreateModal.tsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/apis/financeApi';
import { QUERY_KEYS } from '@/constants';

// CHUẨN HÓA 100%: Thay đổi tất cả đường dẫn import về viết thường (.ui/dialog, /button, /input)
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/common/ui/Dialog";
import { Button } from "@/components/common/ui/Button";
import { Input } from "@/components/common/ui/Input";

export const PeriodCreateModal = () => {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const queryClient = useQueryClient();

    const createPeriodMutation = useMutation({
        mutationFn: (newTitle: string) => financeApi.createPeriod({ title: newTitle }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PERIODS] });
            setOpen(false);
            setTitle('');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        createPeriodMutation.mutate(title);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {/* Đảm bảo nút bấm có loại button rõ ràng để không kích hoạt nhầm form cha */}
                <Button type="button" className="cursor-pointer z-10">
                    + Chu kỳ ngân sách mới
                </Button>
            </DialogTrigger>

            {/* Thêm class cố định bg-white và shadow để chắc chắn Dialog không bị trong suốt */}
            <DialogContent className="sm:max-w-[400px] bg-white text-slate-900 p-6 rounded-lg border shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-slate-900">
                        Tạo chu kỳ chi tiêu mới
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2 block clear-both">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 block">
                            Tên chu kỳ quản lý
                        </label>
                        <Input
                            type="text"
                            placeholder="Ví dụ: Chi tiêu tháng 06/2026, Du lịch hè"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            className="w-full border border-slate-200 bg-white text-slate-900"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-slate-900 text-white hover:bg-slate-800"
                        disabled={createPeriodMutation.isPending}
                    >
                        {createPeriodMutation.isPending ? 'Đang khởi tạo...' : 'Kích hoạt chu kỳ'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};