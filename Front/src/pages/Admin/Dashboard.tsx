import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { authService } from "../../services/AuthService.tsx";

const connectedUser = authService.getCurrentUser();
const links = [
    {
        to: "/",
        label: "Revenir au site web",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 16 16"
                className="inline-block mr-2"
            >
                <path
                    fillRule="evenodd"
                    d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5M10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5"
                />
            </svg>
        ),
    },
    {
        to: "/admin/dashboard/products",
        label: "Product management",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="inline-block mr-2"
            >
                <path d="M4 3h16v4H4zM4 9h16v12H4z" />
            </svg>
        ),
    },
    {
        to: "/admin/dashboard/users",
        label: "Users management",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="inline-block mr-2"
            >
                <circle cx="12" cy="7" r="4" />
                <path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2z" />
            </svg>
        ),
    },
    {
        to: "/admin/dashboard/orders",
        label: "Orders management",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="inline-block mr-2"
            >
                <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
            </svg>
        ),
    },
];

const AdminDashboard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [errors, setErrors] = useState<Record<string, string | string[]>>({});
    const location = useLocation();

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            setErrors({ general: "Please log in to access this page" });
        } else if (!authService.isAdmin()) {
            setErrors({ general: "Unauthorized: Admin access required" });
        }
    }, []);

    return (
        <div className="flex h-screen font-sans bg-gradient-to-r from-indigo-50 to-white">
            {/* Sidebar */}
            <aside className="w-64 p-6 border-r border-gray-300 bg-white shadow-lg flex flex-col">
                <div className="flex flex-col gap-5">
                    <nav aria-label="Main navigation" className="flex flex-col space-y-3">
                    {links.map(({ to, label, icon }) => {
                        const isActive = location.pathname === to;
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={`flex items-center px-4 py-3 rounded font-medium transition-colors duration-200
                  ${
                                    isActive
                                        ? "bg-indigo-600 text-white shadow-md"
                                        : "text-gray-700 hover:bg-indigo-100 hover:text-indigo-700"
                                }
                  focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            >
                                {icon}
                                <span>{label}</span>
                            </Link>
                        );
                    })}
                </nav>
                    <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-2xl shadow-md p-10">
                        <h1 className="text-lg font-semibold text-gray-800 mb-2">Admin connecté</h1>
                        <p className="text-base font-medium text-indigo-600">{connectedUser?.name}</p>
                        <p className="text-sm text-gray-500">ID: {connectedUser?.id}</p>
                    </div>

                </div>


            </aside>

            {/* Main content */}
            <main className="flex-1 bg-gray-100 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-auto p-6">
                {/* Error Message */}
                {errors.general && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 text-red-700 rounded-xl shadow-lg backdrop-blur-sm">
                        <div className="flex items-center">
                            <svg
                                className="w-5 h-5 mr-3 text-red-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            {Array.isArray(errors.general) ? errors.general[0] : errors.general}
                        </div>
                    </div>
                )}

                {!errors.general && children}
            </main>
        </div>
    );
};

export default AdminDashboard;
