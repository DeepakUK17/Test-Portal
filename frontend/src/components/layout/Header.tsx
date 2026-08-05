import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';

export const Header = () => {
    const { role, logout } = useAuthStore();

    return (
        <header className="bg-white border-b h-16 flex items-center justify-between px-6 shadow-sm">
            <div className="flex items-center">
                {/* Left side actions if any */}
            </div>
            
            <div className="flex items-center gap-4">
                <a href="https://deepakuk.me" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors hidden sm:block">
                    Developed by Deepak UK (24BTAD013)
                </a>
                <div className="text-sm text-gray-700">
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-500 uppercase">{role}</span>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                </Button>
            </div>
        </header>
    );
};
