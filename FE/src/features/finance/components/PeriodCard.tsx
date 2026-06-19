// src/features/finance/components/PeriodCard.tsx
import React from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/Card';
import { Button } from '@/components/common/ui/Button';
import { dateService } from '@/services/dateService';

interface PeriodCardProps {
    period: {
        id: number;
        title: string;
        created_at: string;
    };
}

export const PeriodCard: React.FC<PeriodCardProps> = ({ period }) => {
    return (
        <Card className="hover:border-slate-400 transition-colors bg-white shadow-xs">
            <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hũ lớn đang chạy</span>
                </div>
                <CardTitle className="text-lg font-bold text-slate-900">{period.title}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                    Khởi tạo ngày: {dateService.format(period.created_at, 'DD/MM/YYYY')}
                </p>
            </CardHeader>
            <CardContent>
                {/* FIX TẠI ĐÂY: Thêm thuộc tính from và ép kiểu truyền param an toàn */}
                <Link
                    to="/budgets/$periodId"
                    params={{ periodId: String(period.id) }} // Truyền ID hũ lớn trực tiếp lên URL theo dạng /budgets/1
                    className="w-full block"
                >
                    <Button variant="secondary" className="w-full text-xs font-semibold cursor-pointer">
                        Xem chi tiết 6 hũ nhỏ →
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
};