import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
    title?: string;
    message: string;
    onRetry?: () => void;
}

export const ErrorState = ({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-lg border border-red-100">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-900">{title}</h3>
            <p className="mt-2 text-sm text-red-600 max-w-md">{message}</p>
            {onRetry && (
                <Button onClick={onRetry} variant="outline" className="mt-6 border-red-200 text-red-700 hover:bg-red-100">
                    Try Again
                </Button>
            )}
        </div>
    );
};
