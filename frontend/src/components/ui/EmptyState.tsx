import type { ReactNode } from 'react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: ReactNode;
    action?: ReactNode;
}

export const EmptyState = ({ title, description, icon = <FileQuestion className="w-12 h-12 text-gray-400" />, action }: EmptyStateProps) => {
    return (
        <div className="text-center p-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-center mb-4">{icon}</div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-500 mb-6">{description}</p>
            {action && <div>{action}</div>}
        </div>
    );
};
