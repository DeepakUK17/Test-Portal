import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface TableProps {
    headers: string[];
    children: ReactNode;
    className?: string;
}

export const Table = ({ headers, children, className }: TableProps) => {
    return (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
            <table className={cn("min-w-full divide-y divide-gray-200", className)}>
                <thead className="bg-gray-50">
                    <tr>
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {children}
                </tbody>
            </table>
        </div>
    );
};
