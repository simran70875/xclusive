import { useEffect, useState } from "react";
import Button from "../components/ui/button/Button";
import { Order, Product } from "../types/order";
import { useAxios } from "../hooks/useAxios";
import { API_PATHS } from "../utils/config";
import { useLocation } from "react-router";
import Alert from "../components/ui/alert/Alert";

export default function QuotationDetailsPage() {
    const COMMISSION_RATE = 0.175;

    const location = useLocation();
    const orderId = location.state.orderId;

    const [showSuccess, setShowSuccess] = useState("");
    const [showError, setShowError] = useState("");

    const { data, refetch } = useAxios<Order>({
        url: API_PATHS.GET_ORDER + "/" + orderId,
    });


    const [editableProducts, setEditableProducts] = useState<Product[]>([]);

    useEffect(() => {
        if (data?.products) {
            const processed = data.products.map(p => ({
                ...p,
                totalPrice: (p.quantity || 0) * (p.unitPrice || 0),
                grossProfit: (p.unitPrice || 0) - (p.buyPrice || 0),
                commission: ((p.unitPrice || 0) - (p.buyPrice || 0)) * COMMISSION_RATE,
            }));
            setEditableProducts(processed);
        }
    }, [data]);

    const handlePriceChange = (id: string, newPrice: number) => {
        setEditableProducts((prev) =>
            prev?.map((p) =>
                p._id === id
                    ? {
                        ...p,
                        unitPrice: newPrice,
                        totalPrice: (p.quantity ?? 0) * newPrice,
                        grossProfit: newPrice - (p.buyPrice ?? 0),
                        commission: (newPrice - (p.buyPrice ?? 0)) * COMMISSION_RATE,
                    }
                    : p
            )
        );
    };

    const handleBuyPriceChange = (id: string, newPrice: number) => {
        setEditableProducts((prev) =>
            prev?.map((p) =>
                p._id === id
                    ? {
                        ...p,
                        buyPrice: newPrice,
                        grossProfit: (p.unitPrice ?? 0) - newPrice,
                        commission: ((p.unitPrice ?? 0) - newPrice) * COMMISSION_RATE,
                    }
                    : p
            )
        );
    };

    const calculateSubtotal = () => editableProducts?.reduce((sum, p) => sum + (p.totalPrice ?? 0), 0);

    const [deliveryCharges, setDeliveryCharges] = useState(0);

    useEffect(() => {
        if (data?.deliveryCharges) {
            setDeliveryCharges(data?.deliveryCharges);
        }
    }, [data])

    const subtotal = calculateSubtotal() || 0;
    const taxAmount = (subtotal * 20) / 100;
    const total = subtotal + taxAmount + deliveryCharges;

    const order: Order = {
        orderId: orderId,
        email: data?.email || "",
        phone: data?.phone || "",
        billingAddress: data?.billingAddress,
        invoiceAddress: data?.invoiceAddress,
        firstName: data?.firstName || "",
        lastName: data?.lastName || "",
        deliveryCharges: data?.deliveryCharges || deliveryCharges,
        deliveryInstructions: data?.deliveryInstructions,
        poNumber: data?.poNumber,
        address: data?.address,
        address2: data?.address2,
        city: data?.city,
        postcode: data?.postcode,
        company: data?.company,
        sessionId: "sess_abc_456",
        message: data?.message,
        products: editableProducts,
        status: data?.status,
        subtotal,
        total,
    };

    const {
        // data: sendData,
        // error: sendError,
        loading: sendLoading,
        refetch: sendQuotation,
    } = useAxios({
        method: "post",
        url: API_PATHS.SEND_INVOICE,
        body: { orderId: order.orderId, deliveryCharges: order.deliveryCharges, products: order.products, subtotal: order.subtotal, tax: taxAmount, total: order.total },
        manual: true,
    });


    const handleSendQuotation = async () => {
        try {

            // ✅ Check if any product is missing a price or has 0 price
            const hasInvalidPrice = order?.products?.some(
                (product) =>
                    !product.buyPrice || product.buyPrice <= 0 ||
                    !product.unitPrice || product.unitPrice <= 0
            );
            if (hasInvalidPrice) {
                return setShowError("Cannot send quotation: one or more products are missing prices.");
            }

            if (!order.subtotal || order.subtotal <= 0) {
                return setShowError("Failed to send quotation: subtotal must be greater than 0.");
            }

            await sendQuotation();
            setShowSuccess("Quotation Sent Successfully"); // ✅ trigger alert
            refetch();
            setShowError("");
        } catch (err) {
            console.error("Failed to send quotation:", err);
            setShowError("Failed to send quotation");
            setShowSuccess("");
        }
    };


    const Spinner = () => (
        <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
    );


    if (sendLoading) return <Spinner />;

    return (
        <div className="space-y-4">

            {showSuccess != "" && (
                <Alert
                    variant="success"
                    title={showSuccess}
                    message={showSuccess}

                />
            )}


            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                    Quotation Details
                </h2>
            </div>

            {/* Customer Info */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 mb-8">
                <h2 className="text-xl font-medium mb-4">Customer Information</h2>
                <table className="w-full text-sm text-left border border-gray-200 dark:border-gray-700">
                    <tbody>
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-2 font-medium bg-gray-50 dark:bg-gray-800 w-40">Name</th>
                            <td className="p-2">{data?.firstName} {data?.lastName}</td>
                        </tr>
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-2 font-medium bg-gray-50 dark:bg-gray-800">Email</th>
                            <td className="p-2">{data?.email}</td>
                        </tr>
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-2 font-medium bg-gray-50 dark:bg-gray-800">Phone</th>
                            <td className="p-2">{data?.phone}</td>
                        </tr>
                        <tr>
                            <th className="p-2 font-medium bg-gray-50 dark:bg-gray-800">Address</th>
                            <td className="p-2">{data?.address}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Order Info */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 mb-8">
                <h2 className="text-xl font-medium mb-4">Order Information</h2>
                <table className="w-full text-sm text-left border border-gray-200 dark:border-gray-700">
                    <tbody>
                        {[
                            ["Order ID", order.orderId],
                            ["PO Number", order.poNumber],
                            ["Company", order.company],
                            ["Billing Address", order.address],
                            ["Invoice Address", order.invoiceAddress],
                            ["Delivery Instructions", order.deliveryInstructions],
                            ["City", order.city],
                            ["Postcode", order.postcode],
                            ["Status", order.status],
                            ["Message", order.message],
                        ].map(([label, value], i) => (
                            <tr key={i} className="border-b dark:border-gray-700">
                                <th className="p-2 font-medium bg-gray-50 dark:bg-gray-800 w-48">{label}</th>
                                <td className="p-2">{value || "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 mb-8">
                <h2 className="text-xl font-medium mb-4">Products for Quotation</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border border-gray-200 dark:border-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            <tr>
                                <th className="p-2">Image</th>
                                <th className="p-2">Code</th>
                                <th className="p-2">Description</th>

                                <th className="p-2">Buy Price</th>
                                <th className="p-2">Unit Price</th>
                                <th className="p-2">Gross Profit</th>
                                <th className="p-2">Commission (17.5%)</th>
                                <th className="p-2">Quantity</th>
                                <th className="p-2">Total Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {editableProducts?.map((product) => (
                                <tr key={product._id} className="border-b dark:border-gray-700">
                                    <td className="p-2"> <img src={product.image} className="w-20" alt="" /> </td>
                                    <td className="p-2">{product.code}</td>
                                    <td className="p-2">{product.description}</td>


                                    <td className="p-2">
                                        <input
                                            disabled={data?.status !== "Pending"}
                                            type="number"
                                            className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            value={product.buyPrice}
                                            onChange={(e) => handleBuyPriceChange(product?._id, parseFloat(e.target.value) || 0)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            disabled={data?.status !== "Pending"}
                                            type="number"
                                            className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            value={product.unitPrice}
                                            onChange={(e) => handlePriceChange(product._id, parseFloat(e.target.value) || 0)}
                                        />
                                    </td>


                                    <td className="p-2">£{product.grossProfit?.toFixed(2)}</td>
                                    <td className="p-2">£{product.commission?.toFixed(2)}</td>
                                    <td className="p-2">{product.quantity}</td>
                                    <td className="p-2 font-medium text-gray-800 dark:text-white">£{product.totalPrice?.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Price Summary & Actions (unchanged) */}

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 mb-8 w-full">
                <h2 className="text-xl font-medium mb-4">Price Summary</h2>
                <table className="w-full text-sm text-left border border-gray-200 dark:border-gray-700 mb-4">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            <th className="p-2 w-1/4">Subtotal</th>
                            <th className="p-2 w-1/4">Delivery Charges</th>
                            <th className="p-2 w-1/4">Tax (20%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="text-gray-900 dark:text-white">
                            <td className="p-2">£{subtotal.toFixed(2)}</td>
                            <td className="p-2">
                                <input
                                    disabled={data?.status !== "Pending"}
                                    type="number"
                                    value={deliveryCharges}
                                    min={0}
                                    onChange={(e) => setDeliveryCharges(parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                />
                            </td>
                            <td className="p-2">
                                £{taxAmount}
                                {/* <input
                                    type="number"
                                    value={tax}
                                    min={0}
                                    onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                /> */}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Additional Summary: Gross Profit & Commission */}
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-800 dark:text-gray-200">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 shadow-sm">
                        <p className="font-medium">Total Gross Profit</p>
                        <p className="text-green-600 font-semibold">
                            £{editableProducts?.reduce((acc, p) => acc + (p.grossProfit ?? 0) * (p.quantity ?? 0), 0).toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 shadow-sm">
                        <p className="font-medium">Total Commission Amount</p>
                        <p className="text-blue-600 font-semibold">
                            £{editableProducts?.reduce((acc, p) => acc + (p.commission ?? 0) * (p.quantity ?? 0), 0).toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 shadow-sm">
                        <p className="font-medium"> Total Invoice Amount</p>
                        <p className="text-purple-600 font-semibold">
                            £{total.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>


            {data?.status == "Pending" && (
                <div className="flex justify-start gap-3 mt-4">
                    <Button variant="outline" size="sm">Cancel</Button>
                    <Button variant="primary" size="sm" onClick={handleSendQuotation}>Send Quotation</Button>
                </div>
            )}
            {showError != "" && (
                <Alert
                    variant="error"
                    title={showError}
                    message={showError}
                />
            )}


        </div>
    );
}
