import { useEffect, useState } from "react";
import { API_PATHS } from "../utils/config";
import type { Customer, Order } from "../types/order";
import { useAxios } from "../hooks/useAxios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import OrangeOutlineButton from "../components/Button/OrangeOutlineButton";
import { LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { loginSuccess, logout } from "../features/auth/authSlice";
import type { User } from "../types/auth";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const UserProfilePage = () => {
    const [activeTab, setActiveTab] = useState("orders");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { data } = useAxios<Order[]>({
        url: `${API_PATHS.GET_ALL_ORDERS}`,
    });

    const orders: Order[] = data || [];
    const { user, token } = useAuth();
    const userId = user?.userId;

    const [formData, setFormData] = useState<Customer>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        company: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || "",
                city: user.city || "",
                company: user.company || ""
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };


    const {
        data: profileEditData,
        refetch: updateProfile
    } = useAxios<User>({
        method: "put",
        url: `${API_PATHS.EDIT_PROFILE}`,
        body: formData, // no need to wrap in `{ formData }`
        manual: true,
        successMessage: "Profile updated successfully!",
        errorMessage: "Failed to update profile.",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfile(); // triggers the PUT request
    };

    // Dispatch to Redux on success
    useEffect(() => {
        if (profileEditData && token && userId) {
            dispatch(loginSuccess({ user: profileEditData, token, userId }));
        }
    }, [profileEditData, token, userId]);


    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const {
        // data: passwordData,
        refetch: updatePassword
    } = useAxios<User>({
        method: "put",
        url: `${API_PATHS.CHANGE_PASSWORD}`,
        body: {
            currentPassword, newPassword
        }, // no need to wrap in `{ formData }`
        manual: true,
        successMessage: "Password updated successfully!",
        errorMessage: "Failed to update Password.",
    });

    const handleUpdatePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("All fields are required.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New password and confirm password do not match.");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }

        updatePassword(); // Calls your useAxios hook
    };


    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);


    return (
        <div className="container-padding section-space">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                {/* Tabs */}

                <div className="flex justify-between border-b border-gray-300 mb-6 ">
                    <div className="flex flex-1 space-x-6 text-sm font-medium">
                        <button
                            className={`pb-2 ${activeTab === "orders" ? "border-b-2 border-pink-600 text-pink-600" : "text-gray-500"}`}
                            onClick={() => setActiveTab("orders")}
                        >
                            Order History
                        </button>
                        <button
                            className={`pb-2 ${activeTab === "profile" ? "border-b-2 border-pink-600 text-pink-600" : "text-gray-500"}`}
                            onClick={() => setActiveTab("profile")}
                        >
                            Edit Profile
                        </button>
                        <button
                            className={`pb-2 ${activeTab === "password" ? "border-b-2 border-pink-600 text-pink-600" : "text-gray-500"}`}
                            onClick={() => setActiveTab("password")}
                        >
                            Change Password
                        </button>
                    </div>

                    <div onClick={() => {
                        dispatch(logout());
                        navigate("/")
                    }} className="text-red-600 flex gap-2  text-sm font-medium items-center cursor-pointer pb-5"><LogOut size={15} /> Logout</div>
                </div>

                {/* Tab Content */}
                {activeTab === "orders" && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Order History</h2>

                        {
                            orders?.map((order) => {
                                return (
                                    <div key={order.orderId} className="border rounded-lg p-6 bg-gray-50 space-y-4 text-sm text-gray-700 mb-10">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <p><span className="font-semibold">Order ID:</span> {order.orderId}</p>
                                            <p><span className="font-semibold bg-green-400">Status:</span> {order.status}</p>
                                            <p><span className="font-semibold">PO Number:</span> {order.poNumber ? order.poNumber : "NA"}</p>
                                            <p><span className="font-semibold">Date:</span> {order.createdAt}</p>
                                        </div>

                                        <hr className="my-4" />

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="font-semibold mb-1">Shipping Address:</p>
                                                <p>{order.address}</p>
                                                <p>{order.city} {order.postcode}</p>
                                                <p></p>
                                            </div>
                                            <div>
                                                <p className="font-semibold mb-1">Invoice Address:</p>
                                                <p>{order.invoiceAddress}</p>
                                            </div>
                                            <div>
                                                {
                                                    order.status == "Quotation Sent" ? <OrangeOutlineButton onClick={() => {
                                                        window.open(`/confirm-order/${order?.orderId}`, "_blank")

                                                    }} label="Confirm Order" /> :
                                                        <>
                                                            <p className="font-semibold">Delivery Instructions:</p>
                                                            <p>{order.deliveryInstructions}</p>
                                                        </>
                                                }

                                            </div>
                                            <div>
                                                <p><span className="text-gray-600">Subtotal:</span> £{order.subtotal}</p>
                                                <p><span className="text-gray-600">Tax:</span> £{order.tax}</p>
                                                <p><span className="text-gray-600">Delivery:</span> £{order.deliveryCharges}</p>
                                                <p><span className="text-gray-800 font-bold bg-amber-400">Total:</span> £{order.total}</p>
                                            </div>
                                        </div>



                                        <hr className="my-4" />

                                        <div>
                                            <p className="font-semibold mb-2">Products Ordered:</p>
                                            <div className="divide-y">
                                                {/* Product 1 */}

                                                {
                                                    order?.products?.map((product) => {
                                                        return (
                                                            <div key={product.productId} onClick={() => navigate(`/projectDetails/${product.productId}`)} className="py-2 flex gap-4">
                                                                <img src={product.image} alt={product.code} className="w-16 h-16 object-cover rounded" />
                                                                <div>
                                                                    <p className="font-medium">{product.description}</p>
                                                                    <p>Code: {product.code}</p>
                                                                    <p>Qty: {product.quantity} | Unit Price: £{product.unitPrice} | Total: £{product.totalPrice}</p>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }


                                            </div>
                                        </div>




                                    </div>
                                )
                            })
                        }

                    </div>
                )}


                {activeTab === "profile" && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                                <input
                                    type="text"
                                    disabled
                                    value={user?.userId || ""}
                                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 text-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                />
                            </div>

                            <div className="md:col-span-2 flex justify-end mt-4">
                                <button
                                    type="submit"
                                    className="bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700 transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                )}


                {activeTab === "password" && (
                    <div>
                        <h2 className="text-xl font-semibold">Change Password</h2>
                        <p className="app-text mb-4">
                            Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
                        </p>

                        <form className="space-y-4" onSubmit={handleUpdatePasswordSubmit}>
                            {/* Current Password */}
                            <div className="relative">
                                <label className="block text-sm font-medium mb-1">Current Password</label>
                                <input
                                    type={showCurrent ? "text" : "password"}
                                    className="w-full border rounded p-2 pr-10"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                                <span
                                    className="absolute right-3 top-[35px] cursor-pointer text-gray-500"
                                    onClick={() => setShowCurrent((prev) => !prev)}
                                >
                                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                                </span>
                            </div>

                            {/* New Password */}
                            <div className="relative">
                                <label className="block text-sm font-medium mb-1">New Password</label>
                                <input
                                    type={showNew ? "text" : "password"}
                                    className="w-full border rounded p-2 pr-10"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <span
                                    className="absolute right-3 top-[35px] cursor-pointer text-gray-500"
                                    onClick={() => setShowNew((prev) => !prev)}
                                >
                                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                </span>
                            </div>

                            {/* Confirm New Password */}
                            <div className="relative">
                                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    className="w-full border rounded p-2 pr-10"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <span
                                    className="absolute right-3 top-[35px] cursor-pointer text-gray-500"
                                    onClick={() => setShowConfirm((prev) => !prev)}
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </span>
                            </div>

                            <button
                                type="submit"
                                className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
                            >
                                Change Password
                            </button>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
};

export default UserProfilePage;
