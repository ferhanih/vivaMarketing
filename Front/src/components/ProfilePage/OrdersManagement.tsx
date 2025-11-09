import { useEffect, useState } from "react";
import { authService } from "../../services/AuthService.tsx";
import { API_URL, makeAuthenticatedRequest } from "../../services/Requests.tsx";

interface product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    category_id: number;
}
interface item {
    id: number;
    order_id: number;
    product_id: string;
    quantity: number;
    price_at_time: number;
    product: product;
}
interface Order {
    id: number;
    user_id: number;
    total_price: number;
    created_at: string;
    status: string;
    items: item[];
}

export default function OrdersManagement() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [updated, setUpdated] = useState(false);
    const [errors, setErrors] = useState<Record<string, string | string[]>>({});
    const [loading, setLoading] = useState(false);
    const [modal, setModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const admin = authService.isAdmin();

    const fetchOrders = async () => {
        try {
            const FetchUrl = admin ? "/admin/orders" : "/orders";
            setLoading(true);
            const data = await makeAuthenticatedRequest(`${API_URL}${FetchUrl}`);
            setOrders(admin ? data.data : data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            setErrors({ general: "Failed to load orders" });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOrder = async (id: number) => {
        if (!confirm("Do you really want to delete this order?")) return;
        if (!admin) return;
        try {
            setLoading(true);
            await makeAuthenticatedRequest(`${API_URL}/admin/orders/${id}`, { method: "DELETE" });
            await fetchOrders();
            alert("Order deleted!");
        } catch (error: any) {
            console.error("Failed to delete order:", error);
            setErrors({ general: error.message || "Failed to delete order" });
        } finally {
            setLoading(false);
        }
    };

    const validateInputs = (quantity: number | null): Record<string, string> => {
        const errors: Record<string, string> = {};
        if (quantity === null || quantity <= 0) errors.quantity = "Quantity must be at least 1.";
        return errors;
    };

    const handleQuantityChange = (itemId: number, newQuantity: number) => {
        if (!selectedOrder) return;
        const updatedItems = selectedOrder.items.map(item =>
            item.id === itemId && item.product.stock >= newQuantity
                ? { ...item, quantity: newQuantity }
                : item
        );
        setErrors(validateInputs(newQuantity));
        setSelectedOrder(prev => prev ? { ...prev, items: updatedItems } : null);
    };

    const handleStatusChange = (newStatus: string) => {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    };

    const handleSave = async () => {
        if (!selectedOrder) return;

        let hasError = false;
        const collectedErrors: Record<string, string> = {};
        for (const item of selectedOrder.items) {
            const validationErrors = validateInputs(item.quantity);
            if (Object.keys(validationErrors).length > 0) {
                hasError = true;
                collectedErrors[item.id.toString()] = validationErrors.quantity;
            }
        }

        if (hasError) {
            setErrors(collectedErrors);
            return;
        }

        try {
            const data = { status: selectedOrder.status, items: selectedOrder.items };
            setLoading(true);
            await makeAuthenticatedRequest(`${API_URL}/orders/${selectedOrder.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            await fetchOrders();
            setErrors({});
            setModalOpen(false);
            setUpdated(true);
        } catch (error: any) {
            console.error("Failed to update order:", error);
            try {
                setErrors(JSON.parse(error.message));
            } catch {
                setErrors({ general: error.message || "Failed to update order" });
            }
        } finally {
            setLoading(false);
            setTimeout(() => setUpdated(false), 3000);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    return (
        <section className="antialiased p-4 md:p-12 w-full h-full">

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                            Orders Management
                        </h1>
                        <p className="text-slate-600 text-lg">
                            {admin ? "Manage the orders of your website." : "Manage your orders"}
                        </p>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="text-center">
                    <div className="inline-flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-slate-600 font-medium">Loading orders...</span>
                    </div>
                </div>
            )}

            {!loading && orders.length === 0 && (
                <div className="text-center text-gray-600">No order found.</div>
            )}

            {updated && !loading && (
                <div className="pb-6">
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200/50 text-emerald-700 rounded-xl shadow-lg backdrop-blur-sm text-center">
                        Order updated.
                    </div>
                </div>
            )}

            {!loading && orders.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-gray-300 shadow-sm mx-auto max-w-5xl bg-white">
                    <table className="w-full min-w-max">
                        <thead className="bg-gradient-to-r from-slate-50 to-blue-50 backdrop-blur-sm">
                        <tr>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Order ID</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Price</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider hidden sm:table-cell">Adress</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {orders.map(order => (
                            <tr key={order.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                                <td className="py-4 px-6 font-semibold text-slate-800">{order.id}</td>
                                <td className="py-4 px-6 font-semibold text-slate-800">{order.created_at.slice(0,10)}</td>
                                <td className="py-4 px-6 font-semibold text-slate-800">{order.total_price}</td>
                                <td className="py-4 px-6 font-semibold text-slate-800 bg-white">{order.status}</td>
                                <td className="py-4 px-6 font-semibold text-slate-800 hidden sm:table-cell">none</td>
                                <td className="py-4 px-6 flex space-x-3">
                                    {admin && (
                                        <button onClick={() => handleDeleteOrder(order.id)} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium">
                                            Cancel
                                        </button>
                                    )}
                                    <button onClick={() => { setSelectedOrder(order); setModalOpen(true); }} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                                        {admin ? 'Edit' : 'Details'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal for order details */}
            {modal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-lg border border-white/20 max-h-[90vh] overflow-y-auto p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                            <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Order info */}
                        <table className="w-full text-sm text-left text-gray-700 border border-gray-300 rounded-xl mb-6">
                            <thead className="text-xs text-gray-600 uppercase bg-gray-100 border-b">
                            <tr>
                                <th className="px-4 py-3">Order ID</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 hidden sm:table-cell">Adress</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td className="px-4 py-2">{selectedOrder.id}</td>
                                <td className="px-4 py-2">{selectedOrder.created_at.slice(0,10)}</td>
                                <td className="px-4 py-2">
                                    <select className="bg-white" value={selectedOrder.status} onChange={e => handleStatusChange(e.target.value)} disabled={!admin}>
                                        <option value="pending">pending</option>
                                        <option value="paid">paid</option>
                                        <option value="shipped">shipped</option>
                                    </select>
                                </td>
                                <td className="px-4 py-2 hidden sm:table-cell">none</td>
                            </tr>
                            </tbody>
                        </table>

                        {/* Order items */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Order products</label>
                            <table className="w-full text-sm text-left text-gray-700 border border-gray-300 rounded-xl">
                                <thead className="text-xs text-gray-600 uppercase bg-gray-100 border-b">
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Price</th>
                                    <th className="px-4 py-3">Quantity</th>
                                </tr>
                                </thead>
                                <tbody>
                                {selectedOrder.items.map((item, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-2">{item.product.id}</td>
                                        <td className="px-4 py-2">{item.product.name}</td>
                                        <td className="px-4 py-2">{item.product.price} €</td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="number"
                                                min={0}
                                                max={item.product.stock}
                                                className="w-16 bg-white border rounded px-2 py-1 text-center"
                                                value={item.quantity}
                                                onChange={e => handleQuantityChange(item.id, parseInt(e.target.value))}
                                                disabled={!admin}
                                            />
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Total */}
                        <div className="flex justify-center pt-4">
                            <table className="w-48 text-center text-sm text-gray-700 border border-gray-300 rounded-xl mb-6">
                                <thead className="text-xs text-gray-600 uppercase bg-gray-100 border-b">
                                <tr><th>Total price</th></tr>
                                </thead>
                                <tbody>
                                <tr><td>{selectedOrder.total_price} €</td></tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                            <button onClick={() => { setModalOpen(false); setErrors({}); }} className="px-5 py-2 border rounded-xl text-gray-600 hover:bg-gray-100">Close</button>
                            {admin && <button onClick={handleSave} className="px-5 py-2 border rounded-xl text-gray-600 hover:bg-gray-100">Save</button>}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
