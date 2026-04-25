import { NavLink, Outlet } from 'react-router-dom';

const BASE_PATH = (import.meta.env.VITE_BASE_PATH as string) || (import.meta.env.PROD ? '/Finance-Management-Web' : '');

const navItems = [
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/transactions', label: 'Transactions', icon: '💸' },
    { to: '/budgets', label: 'Budgets', icon: '📋' },
    { to: '/accounts', label: 'Accounts', icon: '🏦' },
    { to: '/categories', label: 'Categories', icon: '🏷️' },
    { to: '/reports', label: 'Reports', icon: '📈' },
    { to: '/debugger', label: 'Debugger', icon: '🔧' },
];

export default function Layout() {
    const bgImage = `${BASE_PATH}/background_zhuang.jpg`;

    return (
        <div
            className="min-h-screen bg-gray-100"
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
            }}
        >
            <div className="min-h-screen bg-black/30">
                <header className="bg-white/90 shadow backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-800">Finance Manager</h1>
                            <nav className="flex gap-2 flex-wrap">
                                {navItems.map(item => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        className={({ isActive }) =>
                                            `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                                isActive
                                                    ? 'bg-blue-500 text-white'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`
                                        }
                                    >
                                        <span>{item.icon}</span>
                                        <span>{item.label}</span>
                                    </NavLink>
                                ))}
                            </nav>
                        </div>
                    </div>
                </header>
                <main className="max-w-7xl mx-auto px-4 py-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}