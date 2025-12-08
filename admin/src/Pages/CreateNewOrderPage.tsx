import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/button/Button";
import { Product } from "../types/order";
import { IconButton } from "@mui/material";
import { GridAddIcon } from "@mui/x-data-grid";
import { Delete } from "lucide-react";
import { useAxios } from "../hooks/useAxios";
import { API_PATHS } from "../utils/config";
import { useProductList } from "../hooks/useProductList";
import { useCustomerList } from "../hooks/useCustomerList";
import { User } from "../types/auth";
import Select from "../components/form/input/SelectField";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router";


export default function CreateNewOrderPage() {
    const COMMISSION_RATE = 0.175;

    const { adminUser } = useAuth();
    const { productData } = useProductList();
    const { userData } = useCustomerList();


    const [showSuggestions, setShowSuggestions] = useState(false);
    const [customer, setCustomer] = useState<User>({
        _id: "",
        type: "",
        userId: "",
        password: "",
        email: "",
        phone: "",
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        company: "",
        postcode: "",
        isActive: true
    });

    // Filter users based on first name input
    const filteredUsers = useMemo(() => {
        const search = customer.firstName.toLowerCase();
        return (
            userData?.filter(
                (user) =>
                    user?.firstName?.toLowerCase().includes(search) ||
                    user?.lastName?.toLowerCase().includes(search) ||
                    user?.email?.toLowerCase().includes(search)
            ) || []
        );
    }, [customer.firstName, userData]);

    useEffect(() => {
        console.log(customer);
    }, [customer])

    const [agent, setAgent] = useState<User>({
        _id: "",
        type: "",
        userId: "",
        password: "",
        email: "",
        phone: "",
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        company: "",
        postcode: "",
        isActive: true
    });

    useEffect(() => {
        if (adminUser && adminUser.type === "agent") {
            setAgent((prev) => ({ ...prev, ...adminUser }));
        }
    }, [adminUser]);

    const {
        data: agentData,
    } = useAxios<User[]>({
        url: `${API_PATHS.AGENTS}`,
        method: "get",
    });

    const [editableProducts, setEditableProducts] = useState<Product[]>([]);
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [activeRow, setActiveRow] = useState<string | null>(null);

    const handleProductSearch = (id: string, field: "code" | "description", value: string) => {
        handleProductFieldChange(id, field, value);

        if (value.length >= 2) {  // only search if at least 2 characters
            const filtered = productData.filter((p) => {
                const searchVal = value.toLowerCase();
                return (
                    p.Code?.toLowerCase().includes(searchVal) ||
                    p.Description?.toLowerCase().includes(searchVal)
                );
            });
            setSuggestions(filtered);
            setActiveRow(id);
        } else {
            setSuggestions([]);
            setActiveRow(null);
        }
    };

    const handleSelectSuggestion = (rowId: string, selectedProduct: Product) => {
        setEditableProducts((prev) =>
            prev.map((product) => {
                if (product._id === rowId) {
                    return {
                        ...product,
                        _id: selectedProduct._id,
                        productId: selectedProduct._id,
                        code: selectedProduct.Code,
                        description: selectedProduct.Description,
                        image: selectedProduct.ImageRef,
                    };
                }
                return product;
            })
        );
        setSuggestions([]);
        setActiveRow(null);
    };

    const handleProductFieldChange = (id: string, field: string, value: any) => {
        setEditableProducts((prev) =>
            prev.map((p) => {
                if (p._id !== id) return p;
                const updated = { ...p, [field]: value };
                updated.totalPrice = (updated.quantity ?? 0) * (updated.unitPrice ?? 0);
                updated.grossProfit = (updated.unitPrice ?? 0) - (updated.buyPrice ?? 0);
                updated.commission = updated.grossProfit * COMMISSION_RATE;
                return updated;
            })
        );
    };

    const handleDeleteProduct = (id: string) => {
        setEditableProducts((prev) => prev.filter((p) => p._id !== id));
    };

    const addProduct = () => {
        setEditableProducts((prev) => [
            ...prev,
            {
                _id: "",
                productId: "",
                code: "",
                description: "",
                quantity: 1,
                unitPrice: 0,
                buyPrice: 0,
                totalPrice: 0,
                grossProfit: 0,
                commission: 0,
            },
        ]);
    };

    const calculateSubtotal = () => editableProducts.reduce((sum, p) => sum + (p.totalPrice ?? 0), 0);
    const [deliveryCharges, setDeliveryCharges] = useState(0);


    const subtotal = calculateSubtotal();
    const taxAmount = (subtotal * 20) / 100;
    const total = subtotal + taxAmount + deliveryCharges;


    const {
        refetch: createOrderRequest,
        loading,
    } = useAxios({
        url: API_PATHS.CREATE_ORDER,
        method: "post",
        manual: true,
        body: {
            agentId: agent.userId,
            userId: customer.userId,

            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
            address: customer.address,
            address2: "",
            phone: customer.phone,
            city: customer.city,
            postcode: customer.postcode,
            company: customer.company,

            products: editableProducts,

            deliveryCharges,
            subtotal,
            tax: taxAmount,
            total,
        }
    });


    // / clear the default user shape once, for reuse
    const defaultUser: User = {
        _id: "",
        type: "",
        userId: "",
        password: "",
        email: "",
        phone: "",
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        company: "",
        postcode: "",
        isActive: true,
    };


    const navigate = useNavigate();

    const handleSendOrder = async () => {

        if (!customer.postcode?.trim() || customer.postcode == undefined) {
            return toast.error("Postcode is required, please enter postcode");
        }

        if (subtotal <= 0 || taxAmount <= 0 || total <= 0) {
            toast.error("Subtotal, tax, and total must be greater than zero.");
            return; // block sending the request
        }

        try {

            await createOrderRequest();


            // clear customer
            setCustomer({ ...defaultUser });

            // clear agent
            setAgent({ ...defaultUser });

            // clear products
            setEditableProducts([]);


            setEditableProducts([]);
            navigate("/quotations");

        } catch (error) {
            console.error("Error sending order:", error);
        }
    };


    const Spinner = () => (
        <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
    );
    if (loading) return <Spinner />;

    return (
        <div className="space-y-4 relative">

            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                Create New Order
            </h2>


            {/* Customer Info */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 mb-8">
                <h2 className="text-xl font-medium mb-4">Customer Information</h2>
                <table className="w-full text-sm text-left border border-gray-200 dark:border-gray-700">
                    <tbody>
                        {['userId', 'firstName', 'lastName', 'email', 'phone', 'address', 'city', 'company', 'postcode'].map((field) => (
                            field === 'userId' ? (
                                <tr
                                    key="userId"
                                    className="border-b dark:border-gray-700 relative"
                                >
                                    <th className="p-2 font-medium bg-gray-50 dark:bg-gray-800 w-40">
                                        Select or Create User
                                    </th>
                                    <td className="p-2">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                placeholder="Start typing a user's name..."
                                                value={customer.firstName}
                                                onChange={(e) => {
                                                    const value = e.target.value;

                                                    if (value.trim() === "") {
                                                        // If input is cleared, reset the entire customer form
                                                        setCustomer({
                                                            _id: "",
                                                            type: "",
                                                            userId: "",
                                                            password: "",
                                                            email: "",
                                                            phone: "",
                                                            firstName: "",
                                                            lastName: "",
                                                            address: "",
                                                            city: "",
                                                            company: "",
                                                            postcode: "",
                                                            isActive: true,
                                                        });
                                                        setShowSuggestions(false);
                                                    } else {
                                                        setCustomer({ ...customer, firstName: value });
                                                        setShowSuggestions(true);
                                                    }
                                                }}
                                                onFocus={() => setShowSuggestions(true)}
                                            />
                                            {showSuggestions && filteredUsers.length > 0 && (
                                                <ul className="absolute z-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 mt-1 rounded max-h-40 overflow-y-auto w-full text-sm">
                                                    {filteredUsers.map((user) => (
                                                        <li
                                                            key={user.userId}
                                                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                                                            onClick={() => {
                                                                setCustomer(user); // Fill with selected user
                                                                setShowSuggestions(false);
                                                            }}
                                                        >
                                                            {user?.firstName} {user?.lastName} ({user?.email})
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={field} className="border-b dark:border-gray-700">
                                    <th className="p-2 font-medium bg-gray-50 dark:bg-gray-800 capitalize w-40">{field}</th>
                                    <td className="p-2">
                                        <input
                                            type="text"
                                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            value={customer[field as keyof User] || ""}
                                            onChange={(e) => setCustomer({ ...customer, [field]: e.target.value })}
                                        />
                                    </td>
                                </tr>
                            )
                        ))}
                    </tbody>
                </table>

            </div>

            {/* Agent Info */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 mb-8">
                <h2 className="text-xl font-medium mb-4">Agent Information</h2>
                <table className="w-full text-sm text-left border border-gray-200 dark:border-gray-700">
                    <tbody>
                        {["userId", "firstName", "lastName", "email", "phone", "address"].map((field) =>
                            field === "userId" ? (
                                <tr key={field} className="border-b dark:border-gray-700">
                                    <th className="p-2 font-medium bg-gray-50 dark:bg-gray-800 w-40">Select Agent</th>
                                    <td className="p-2">
                                        {
                                            adminUser?.type == "agent" ? <>{adminUser?.userId}</> : <Select
                                                name="userId"
                                                value={agent.userId}
                                                onChange={(val) => {
                                                    const selectedAgent = agentData?.find((user) => user.userId === val);
                                                    if (selectedAgent) {
                                                        setAgent(selectedAgent);
                                                    } else {
                                                        setAgent({ ...agent, userId: val });
                                                    }
                                                }}
                                                placeholder="Select Agent"
                                                options={
                                                    agentData?.map((user) => ({
                                                        label: `${user.firstName} ${user.lastName} (${user.email})`,
                                                        value: user.userId,
                                                    })) || []
                                                }
                                                searchable
                                            />
                                        }

                                    </td>
                                </tr>
                            ) : (
                                <tr key={field} className="border-b dark:border-gray-700">
                                    <th className="p-2 font-medium bg-gray-50 dark:bg-gray-800 capitalize w-40">{field}</th>
                                    <td className="p-2">
                                        <input
                                            type="text"
                                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            value={agent[field as keyof User] || ""}
                                            onChange={(e) => setAgent({ ...agent, [field]: e.target.value })}
                                        />
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 mb-8">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white ">
                        Products
                    </h2>
                    <IconButton
                        className="bg-purple-50 hover:bg-purple-100"
                        color="primary"
                        size="small"
                        onClick={addProduct}
                    >
                        <GridAddIcon />
                    </IconButton>


                </div>


                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border border-gray-200 dark:border-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            <tr>
                                <th className="p-2 w-30">Code</th>
                                <th className="p-2 w-80">Description</th>
                                <th className="p-2 w-30">Buy Price</th>
                                <th className="p-2 w-30">Unit Price</th>
                                <th className="p-2 w-30">Quantity</th>
                                <th className="p-2">Gross Profit</th>
                                <th className="p-2">Commission (17.5%)</th>
                                <th className="p-2">Total Price</th>
                                <th className="p-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {editableProducts.map((product) => (
                                <tr key={product._id} className="border-b dark:border-gray-700">
                                    <td className="p-2 w-30">
                                        <input
                                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            type="text"
                                            value={product.code}
                                            onChange={(e) => handleProductSearch(product._id, "code", e.target.value)}
                                        />
                                        {activeRow === product._id && suggestions.length > 0 && (
                                            <ul className="absolute z-10 bg-white dark:bg-gray-800 border rounded shadow text-sm mt-1 max-h-60 max-w-[500px] overflow-auto w-full">
                                                {suggestions.map((s) => (
                                                    <li
                                                        key={s._id}
                                                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                                                        onClick={() => handleSelectSuggestion(product._id, s)}
                                                    >
                                                        {s.Code} - {s.Description}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                    </td>
                                    <td className="p-2 w-80">
                                        <input
                                            type="text"
                                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            value={product.description}
                                            onChange={(e) => handleProductSearch(product._id, "description", e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2 w-30">
                                        <input
                                            type="number"
                                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            value={product.buyPrice}
                                            onChange={(e) => handleProductFieldChange(product._id, "buyPrice", parseFloat(e.target.value) || 0)}
                                        />
                                    </td>
                                    <td className="p-2 w-30">
                                        <input
                                            type="number"
                                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            value={product.unitPrice}
                                            onChange={(e) => handleProductFieldChange(product._id, "unitPrice", parseFloat(e.target.value) || 0)}
                                        />
                                    </td>
                                    <td className="p-2 w-30">
                                        <input
                                            type="number"
                                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            value={product.quantity}
                                            onChange={(e) => handleProductFieldChange(product._id, "quantity", parseFloat(e.target.value) || 0)}
                                        />
                                    </td>
                                    <td className="p-2">£{product.grossProfit?.toFixed(2)}</td>
                                    <td className="p-2">£{product.commission?.toFixed(2)}</td>
                                    <td className="p-2 font-medium text-gray-800 dark:text-white">£{product.totalPrice?.toFixed(2)}</td>
                                    <td className="p-2 w-10">
                                        <IconButton
                                            onClick={() => handleDeleteProduct(product._id)}
                                            size="small"
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>


                </div>
            </div>

            {/* Summary */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 mb-8">
                <h2 className="text-xl font-medium mb-4">Price Summary</h2>
                <table className="w-full text-sm text-left border border-gray-200 dark:border-gray-700 mb-4">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            <th className="p-2 w-1/4">Subtotal</th>
                            <th className="p-2 w-1/4">Delivery Charges</th>
                            <th className="p-2 w-1/4">Tax(20%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="text-gray-900 dark:text-white">
                            <td className="p-2">£{subtotal.toFixed(2)}</td>
                            <td className="p-2">
                                <input
                                    type="number"
                                    value={deliveryCharges}
                                    onChange={(e) => setDeliveryCharges(parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
                                />
                            </td>
                            <td className="p-2">
                                £{taxAmount}
                                {/* <input
                                    type="number"
                                    value={tax}
                                    onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
                                /> */}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className="grid grid-cols-3 gap-4 text-sm text-gray-800 dark:text-gray-200">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 shadow-sm">
                        <p className="font-medium">Total Gross Profit</p>
                        <p className="text-green-600 font-semibold">
                            £{editableProducts.reduce((acc, p) => acc + (p.grossProfit ?? 0) * (p.quantity ?? 0), 0).toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 shadow-sm">
                        <p className="font-medium">Total Commission</p>
                        <p className="text-blue-600 font-semibold">
                            £{editableProducts.reduce((acc, p) => acc + (p.commission ?? 0) * (p.quantity ?? 0), 0).toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 shadow-sm">
                        <p className="font-medium">Total Invoice Amount</p>
                        <p className="text-purple-600 font-semibold">£{total.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-start gap-3 mt-4">
                <Button variant="outline" size="sm">Cancel</Button>
                <Button variant="primary" size="sm" disabled={loading} onClick={handleSendOrder}>Send Quotation</Button>
            </div>
        </div>
    );
}
