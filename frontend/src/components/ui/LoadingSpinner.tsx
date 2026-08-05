import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ className, size = 24 }: { className?: string, size?: number }) => {
    return (
        <Loader2 
            className={cn("animate-spin text-blue-600", className)} 
            size={size} 
        />
    );
};
