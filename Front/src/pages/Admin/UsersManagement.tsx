import { useEffect, useState } from "react";
import { makeAuthenticatedRequest, API_URL } from "../../services/Requests.tsx";
import { authService } from "../../services/AuthService.tsx";

interface roles {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}
interface User {
    id: number;
    name: string;
    email: string;
    phone: number;
    password: string;
    roles: roles[];
}

export default function UsersManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [adminslist, setAdminslist] = useState<User[]>([]);
    const [customerslist, setcustomerslist] = useState<User[]>([]);
    const [errors, setErrors] = useState<Record<string, string | string[]>>({});
    const [loading, setLoading] = useState(false);
    const [modal, setModalOpen] = useState(false);
    const admin = authService.isAdmin();
    const [selecteduser, setSelectedUser] = useState<User>();
    const connectedUser = authService.getCurrentUser();

    /* check admin access */
    useEffect(() => {
        if (!authService.isAuthenticated()) {
            setErrors({ general: "Please log in to access this page" });
        } else if (!authService.isAdmin()) {
            setErrors({ general: "Unauthorized: Admin access required" });
        }
    }, []);

    const handleDeleteUser = async (id: number) => {
        if (!confirm("Do you really want to delete this user ?")) return;
        if (!admin) return;
        try {
            setLoading(true);
            await makeAuthenticatedRequest(`${API_URL}/users/${id}`, { method: "DELETE" });
            await fetchUsers();
            alert("User deleted !");
        } catch (error: any) {
            console.error("Failed to delete user:", error);
            setErrors({ general: error.message || "Failed to delete user" });
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        if (!admin) return;
        try {
            const FetchUrl = "/users";
            setLoading(true);
            const data = await makeAuthenticatedRequest(`${API_URL}${FetchUrl}`);
            setUsers(data);
            setAdminslist(data.filter((user: User) =>
                user.roles.some(role => role.name === 'admin')
            ));
            setcustomerslist(data.filter((user: User) =>
                user.roles.some(role => role.name === 'customer')
            ));
        } catch (error) {
            console.error("Failed to fetch user:", error);
            setErrors({ general: "Failed to load user" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <section className="antialiased p-4 md:p-12 w-full h-full">

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                            Users Management
                        </h1>
                        <p className="text-slate-600 text-lg">Manage the users of your web site.</p>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="text-center">
                    <div className="inline-flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-slate-600 font-medium">Loading users...</span>
                    </div>
                </div>
            )}

            {!loading && !users.length && (
                <div className="text-center text-gray-600">No user found.</div>
            )}

            {!loading && users.length > 0 && (
                <div className="mx-auto max-w-5xl">

                    {errors.general && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 text-red-700 rounded-xl shadow-lg backdrop-blur-sm">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {Array.isArray(errors.general) ? errors.general[0] : errors.general}
                            </div>
                        </div>
                    )}

                    {/* admins */}
                    <div className="mb-8">
                        <h1 className="text-red-700 text-3xl font-mono pb-4 font-bold">Administrators</h1>
                        <div className="overflow-x-auto">
                            <table className="bg-white/70 w-full rounded-3xl min-w-max">
                                <thead>
                                <tr className="bg-gradient-to-r from-slate-50 to-blue-50 backdrop-blur-sm">
                                    <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">User ID</th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Name</th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider hidden sm:table-cell">Email</th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider hidden md:table-cell">Phone</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {adminslist.map(user => (
                                    <tr key={user.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                                        <td className="py-4 px-6 font-semibold text-slate-800">{user.id}</td>
                                        <td className="py-4 px-6 font-semibold text-slate-800">{user.name}</td>
                                        <td className="py-4 px-6 text-slate-600 hidden sm:table-cell">{user.email}</td>
                                        <td className="py-4 px-6 text-slate-600 hidden md:table-cell">{user.phone}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* customers */}
                    <div>
                        <h1 className="text-indigo-700 text-3xl font-mono pb-4 font-bold">Customers</h1>
                        <div className="overflow-x-auto">
                            <table className="bg-white/70 w-full rounded-3xl min-w-max">
                                <thead>
                                <tr className="bg-gradient-to-r from-slate-50 to-blue-50 backdrop-blur-sm">
                                    <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">User ID</th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Name</th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider hidden sm:table-cell">Email</th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider hidden md:table-cell">Phone</th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {customerslist.map(user => (
                                    <tr key={user.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                                        <td className="py-4 px-6 font-semibold text-slate-800">{user.id}</td>
                                        <td className="py-4 px-6 font-semibold text-slate-800">{user.name}</td>
                                        <td className="py-4 px-6 text-slate-600 hidden sm:table-cell">{user.email}</td>
                                        <td className="py-4 px-6 text-slate-600 hidden md:table-cell">{user.phone}</td>
                                        <td className="py-4 px-6">
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-150 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}

        </section>
    );
}
