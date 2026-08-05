import { Card, CardContent } from './Card';
import type { ReactNode } from 'react';

export interface StatCardProps {
    title: string;
    value: string | number;
    icon?: ReactNode;
    trend?: {
        value: string;
        isPositive: boolean;
    };
}

export const StatCard = ({ title, value, icon, trend }: StatCardProps) => {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
                        <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
                    </div>
                    {icon && <div className="p-3 bg-blue-50 rounded-lg text-blue-600">{icon}</div>}
                </div>
                {trend && (
                    <div className="mt-4 flex items-center text-sm">
                        <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                            {trend.isPositive ? '↑' : '↓'} {trend.value}
                        </span>
                        <span className="ml-2 text-gray-500">vs last month</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
