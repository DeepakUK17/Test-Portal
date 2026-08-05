import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface SidebarItem {
    name: string;
    href: string;
    icon?: React.ReactNode;
}

interface SidebarProps {
    items: SidebarItem[];
    className?: string;
}

export const Sidebar = ({ items, className }: SidebarProps) => {
    const location = useLocation();

    return (
        <div className={cn("w-64 bg-white border-r h-full flex flex-col", className)}>
            <div className="p-6 border-b flex items-center justify-center">
                <img src="/logo.png" alt="KAHE Logo" className="h-12 w-auto object-contain" />
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {items.map((item) => {
                    const isActive = location.pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                isActive 
                                    ? "bg-blue-50 text-blue-700" 
                                    : "text-gray-700 hover:bg-gray-100"
                            )}
                        >
                            {item.icon && <span className="mr-3">{item.icon}</span>}
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};
