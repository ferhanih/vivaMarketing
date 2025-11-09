import { authService } from "../../services/AuthService.tsx";
import { useState } from "react";
import { API_URL, makeAuthenticatedRequest } from "../../services/Requests.tsx";

export default function Overview() {
    let user = authService.getCurrentUser();
    let admin = authService.isAdmin();
    const informations = user?.name?.split(" ") || [];

    const [updated, setUpdated] = useState(false);
    const [phone, setPhone] = useState<string>(user?.phone || "");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [email, setEmail] = useState<string>(user?.email || "");
    const [fname, setFname] = useState<string>(informations[0] || "");
    const [lname, setLname] = useState<string>(informations.slice(1).join(" ") || "");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [draftphone, setdraftPhone] = useState<string>(phone);
    const [draftemail, setdraftEmail] = useState<string>(email);
    const [draftfname, setdraftFname] = useState<string>(fname);
    const [draftlname, setdraftLname] = useState<string>(lname);

    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const validateInputs = (
        fname: string,
        lname: string,
        phone: string,
        email: string,
        password: string,
        confirmpassword: string,
    ): Record<string, string> => {
        const errors: Record<string, string> = {};
        const hasDigit = /\d/;

        if (!fname || hasDigit.test(fname) || fname.length < 3) {
            errors.fname = "First name invalid (min 3 chars, no digits).";
        }
        if (!lname || hasDigit.test(lname) || lname.length < 3) {
            errors.lname = "Last name invalid (min 3 chars, no digits).";
        }
        if (phone && phone.length < 8) {
            errors.phone = "Phone invalid (no spaces, no letters).";
        }
        if (!email || email.includes(" ") || !email.includes("@")) {
            errors.email = "Email invalid (must contain @ and no spaces).";
        }

        if (password && password.length < 10) {
            errors.password = "Password must be at least 8 characters.";
        }
        if (password !== confirmpassword) {
            errors.confirmpassword = "Passwords do not match.";
        }

        return errors;
    };

    const handleChange = (newData: string, type: string) => {
        switch (type) {
            case "phone":
                setdraftPhone(newData);
                break;
            case "email":
                setdraftEmail(newData);
                break;
            case "confirmpassword":
                setConfirmPassword(newData);
                break;
            case "password":
                setPassword(newData);
                break;
            case "fname":
                setdraftFname(newData);
                break;
            case "lname":
                setdraftLname(newData);
                break;
        }

        const newErrors = validateInputs(
            type === "fname" ? newData : draftfname,
            type === "lname" ? newData : draftlname,
            type === "phone" ? newData : draftphone,
            type === "email" ? newData : draftemail,
            type === "password" ? newData : password,
            type === "confirmpassword" ? newData : confirmPassword
        );
        setErrors(newErrors);
    };

    const handleSave = async () => {
        const validationErrors = validateInputs(draftfname, draftlname, draftphone, draftemail, password, confirmPassword);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setLoading(true);

            const data: any = {
                id: user?.id,
                name: draftfname + " " + draftlname,
                phone: draftphone,
                email: draftemail,
            };
            if (password) {
                data.password = password;
            }

            await makeAuthenticatedRequest(`${API_URL}/profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            await authService.refreshUserData();

            setFname(draftfname);
            setLname(draftlname);
            setEmail(draftemail);
            setPhone(draftphone);
            setPassword("");
            setConfirmPassword("");
            setErrors({});
            setUpdated(true);
            setIsModalOpen(false);
        } catch (error: any) {
            console.error("Failed to update user:", error);
            if (error.errors?.email) {
                setErrors({ email: error.errors.email[0] });
            } else if (error.errors?.phone) {
                setErrors({ phone: error.errors.phone[0] });
            } else {
                setErrors({ general: "Une erreur est survenue." });
            }
        } finally {
            setLoading(false);
            setTimeout(() => setUpdated(false), 3000);
        }
    };

    const isSaveDisabled = Object.keys(errors).length > 0;

    return (
        <div className="flex flex-col top-0 justify-center border-black h-full w-full text-black pr-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                            Account informations
                        </h1>
                        <p className="text-slate-600 text-lg">Manage the informations of your account.</p>
                    </div>
                </div>
            </div>

            {updated && !loading && (
                <div className="pb-6 w-auto rounded-3xl justify-center h-auto ">
                    <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-emerald-50 border border-emerald-200/50 text-emerald-700 rounded-xl shadow-lg backdrop-blur-sm">
                        <div className="flex items-center">
                            <p className="text-center">Account updated.</p>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center">
                    <div className="inline-flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-slate-600 font-medium">Loading informations...</span>
                    </div>
                </div>
            ) : (
                <div className="pb-10">
                    <div className="overflow-x-auto w-full">
                        <table className="min-w-[700px] bg-white/70 p-8 mb-8 rounded-3xl">
                            <thead>
                            <tr className="bg-gradient-to-r from-slate-50 to-blue-50 backdrop-blur-sm">
                                <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">First name</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Last name</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Phone</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Email</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Password</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Action</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            <tr className="hover:bg-blue-50/50 transition-colors duration-150">
                                <td className="py-4 px-6 font-semibold text-slate-800">{fname}</td>
                                <td className="py-4 px-6 font-semibold text-slate-800">{lname}</td>
                                <td className="py-4 px-6 font-semibold text-slate-800">{phone}</td>
                                <td className="py-4 px-6 text-slate-600">{email}</td>
                                <td className="py-4 px-6 text-slate-600">***********</td>
                                <td className="py-4 px-6">
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-150 text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-xl shadow-lg border border-white/20 max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            <div className="flex flex-col items-center justify-between mb-6">
                                {errors.general && (
                                    <div className="text-red-700">{errors.general}</div>
                                )}
                                <h2 className="text-2xl font-bold text-gray-800">Edit Account</h2>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setErrors({});
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First name</label>
                                    <input
                                        type="text"
                                        value={draftfname}
                                        onChange={(e) => handleChange(e.target.value, "fname")}
                                        className="w-full border rounded-md bg-transparent p-2 mt-1 border-gray-300"
                                    />
                                    {errors.fname && (
                                        <div className="mt-1 text-red-600 text-sm">{errors.fname}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last name</label>
                                    <input
                                        type="text"
                                        value={draftlname}
                                        onChange={(e) => handleChange(e.target.value, "lname")}
                                        className="w-full border rounded-md bg-transparent p-2 mt-1 border-gray-300"
                                    />
                                    {errors.lname && (
                                        <div className="mt-1 text-red-600 text-sm">{errors.lname}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="tel"
                                        value={draftphone}
                                        onChange={(e) => handleChange(e.target.value, "phone")}
                                        className="w-full border rounded-md bg-transparent p-2 mt-1 border-gray-300"
                                    />
                                    {errors.phone && (
                                        <div className="mt-1 text-red-600 text-sm">{errors.phone}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mail</label>
                                    <input
                                        type="email"
                                        value={draftemail}
                                        onChange={(e) => handleChange(e.target.value, "email")}
                                        className="w-full border rounded-md bg-transparent p-2 mt-1 border-gray-300"
                                    />
                                    {errors.email && (
                                        <div className="mt-1 text-red-600 text-sm">{errors.email}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => handleChange(e.target.value, "password")}
                                        className="w-full border rounded-md bg-transparent p-2 mt-1 border-gray-300"
                                    />
                                    {errors.password && (
                                        <div className="mt-1 text-red-600 text-sm">{errors.password}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Confirm password</label>
                                    <input
                                        type="password"
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => handleChange(e.target.value, "confirmpassword")}
                                        className="w-full border rounded-md bg-transparent p-2 mt-1 border-gray-300"
                                    />
                                    {errors.confirmpassword && (
                                        <div className="mt-1 text-red-600 text-sm">{errors.confirmpassword}</div>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setErrors({});
                                            setPassword("");
                                            setConfirmPassword("");
                                            window.location.reload();
                                        }}
                                        className="px-5 py-2 border rounded-xl text-gray-600 hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        className={`px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50`}
                                        disabled={isSaveDisabled || loading}
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
