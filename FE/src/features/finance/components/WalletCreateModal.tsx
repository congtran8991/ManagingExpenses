import React, { useState } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/common/ui/Dialog";
import { Button } from "@/components/common/ui/Button";
import { Input } from "@/components/common/ui/Input";
import { useCreateWallet } from '@/features/wallets/hooks/useWalletQueries';

export const WalletCreateModal = () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [balance, setBalance] = useState('');
    const createWalletMutation = useCreateWallet();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !balance) return;

        createWalletMutation.mutate({ name, balance: Number(balance) }, {
            onSuccess: () => {
                setOpen(false);
                setName('');
                setBalance('');
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>+ Tạo ví thủ công mới</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader><DialogTitle>Thêm ví tài khoản mới</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1">
                        <label className="text-xs font-medium">Tên ví hiển thị</label>
                        <Input type="text" placeholder="Ví dụ: Tiền mặt, Thẻ Techcombank, Ví MoMo" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium">Số dư thực tế ban đầu</label>
                        <Input type="number" placeholder="Ví dụ: 2000000" value={balance} onChange={e => setBalance(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={createWalletMutation.isPending}>
                        {createWalletMutation.isPending ? 'Đang khởi tạo...' : 'Tạo ví tiền'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};