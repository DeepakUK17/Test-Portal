import { cn } from '../../utils/cn';

export interface StatusDotProps {
    status?: 'online' | 'offline' | 'busy' | 'away';
    className?: string;
}

export const StatusDot = ({ status = 'online', className }: StatusDotProps) => {
    const colors = {
        online: 'bg-green-500',
        offline: 'bg-gray-400',
        busy: 'bg-red-500',
        away: 'bg-yellow-500',
    };

    return (
        <span className={cn("relative flex h-3 w-3", className)}>
            {status === 'online' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            )}
            <span className={cn("relative inline-flex rounded-full h-3 w-3", colors[status])}></span>
        </span>
    );
};
