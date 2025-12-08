import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import useFetch from "../hooks/useFetch";
import { API_PATHS } from "../utils/config";
import toast from "react-hot-toast";
import { CheckCircle, Copy } from "lucide-react";
import { jwtDecode } from "jwt-decode";

interface Product {
  _id: string;
  productId: string;
  code: string;
  description: string;
  image: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number
}

interface OrderData {
  _id: string;
  orderId: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  address2: string;
  city: string;
  phone?: string;
  invoiceAddress?: string;
  deliveryCharges?:number;
  poNumber?: string;
  deliveryInstructions?: string;
  postcode: string;
  company: string;
  userId: string;
  message: string;
  products: Product[];
  status: string;
  createdAt: string;
  updatedAt: string;
  subtotal: number;
  total: number;
  tax: number;
  __v: number;
}

interface MyTokenPayload {
  orderId: string;
  userId: string;
}


const OrderConfirmationPage = () => {
  const { token } = useParams();

  const decoded = jwtDecode<MyTokenPayload>(token ?? "");

  console.log(decoded)

  const navigate = useNavigate();

  const { userId, orderId } = decoded


  const url = `${API_PATHS.GET_ORDER}/${orderId}`;
  const { data, loading } = useFetch<OrderData>(url, { userId });

  const [products, setProducts] = useState<Product[]>();
  const [subTotal, setSubTotal] = useState<number>();
  const [tax, setTax] = useState<number>(0);
  const [total, setTotal] = useState<number>();

  useEffect(() => {
    setProducts(data?.products || []);
    setSubTotal(data?.subtotal);
  }, [data]);


  useEffect(() => {
    const subtotal = products?.reduce((acc, p) => acc + p.totalPrice, 0) ?? 0;
    setSubTotal(subtotal);
    setTax(subtotal * 0.20);
  }, [products]);

  useEffect(() => {
    setTotal((subTotal ?? 0) + tax + (data?.deliveryCharges ?? 0));
  }, [subTotal, tax, data]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    address2: "",
    city: "",
    postcode: "",
    invoiceAddress: "",
    deliveryInstructions: "",
    poNumber: "",
    message: "",
  });

  const [termsChecked, setTermsChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // New: step control

  useEffect(() => {
    if (data) {
      setFormData((prev) => ({
        ...prev,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        company: data.company || "",
        email: data.email || "",
        phone: (data as any).phone || "",
        address: data.address || "",
        address2: data.address2 || "",
        city: data.city || "",
        postcode: data.postcode || "",
        message: data.message || "",
      }));
    }
  }, [data]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTermsChecked(e.target.checked);
  };


  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }, [isCopied])

  const copyBillingToInvoice = () => {
    setFormData((prev) => ({ ...prev, invoiceAddress: prev.address }));
    setIsCopied(true);
  };

  // Step 1 button
  const handleConfirmClick = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  // Final submit
  const handleFinalSubmit = async () => {
    if (!termsChecked) {
      toast.error("Please agree to the Terms & Conditions before placing order.")
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        products: products,
        subtotal: subTotal,
        total: total,
        status: "Order Received",
        userId,
      };

      const editOrder = `${API_PATHS.EDIT_ORDER}/${orderId}`;

      await axios.put(editOrder, payload);
      toast.success("Order confirmed successfully!");
      navigate(`/`);

    } catch (error: any) {
      console.error("Error confirming order:", error);
      alert(
        error?.response?.data?.error ||
        "Failed to confirm order. Please try again later."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-padding section-space">
        Loading order details...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-padding section-space">Order not found.</div>
    );
  }

  return (
    <div className="container-padding section-space">
      <div className="text-sm text-gray-600 mb-4">
        <strong className="text-gray-800">Order ID:</strong> {orderId}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col lg:flex-row">
        {/* Left: Order Summary */}
        <div className="w-full lg:w-2/3 p-6 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200">
          <h2 className="text-xl font-bold mb-4">Your Order</h2>

          {products?.length ? (
            products?.map((item, index) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 mb-4 border-b pb-4  hover:bg-gray-100 transition"
              >
                <img
                  onClick={() => navigate(`/projectDetails/${item.productId}`)}
                  src={item.image}
                  alt={item.description}
                  className="w-20 h-20 object-cover rounded cursor-pointer"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{item.description}</h4>
                  <p className="text-xs text-gray-500">Code: {item.code}</p>
                  <p className="text-xs text-gray-500">Price: {item.unitPrice}</p>
                  <div className="text-xs text-gray-500">Qty:  <input readOnly={data?.status != "Quotation Sent"} min={1} className="h-5 w-15 border rounded mt-2 px-2" type="number" value={item.quantity} onChange={(e) => {
                    const newQty = Number(e.target.value);
                    setProducts((prev) =>
                      prev?.map((p, idx) =>
                        idx === index
                          ? {
                            ...p,
                            quantity: newQty,
                            totalPrice: newQty * p.unitPrice,
                          }
                          : p
                      )
                    );
                  }} /></div>
                </div>
                <div className="text-right text-sm font-medium text-gray-800">
                  £{item.totalPrice.toFixed(2)}
                </div>
              </div>
            ))
          ) : (
            <p>No products found in this order.</p>
          )}

          <hr className="my-6" />
          <div className="space-y-2 text-sm text-gray-700 font-medium">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>£{subTotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT (20%)</span>
              <span>£{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              <span>£{data?.deliveryCharges?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 mt-2">
              <span>Total</span>
              <span>£{total?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right: Form Steps */}
        <div className="w-full lg:w-2/3 p-6">
          {step === 1 ? (
            <>
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                Confirm Your Details
              </h2>

              {
                data?.status == "Quotation Sent" ? <form className="space-y-4" onSubmit={handleConfirmClick}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium mb-1"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="w-full border p-2 rounded"
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium mb-1"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className="w-full border p-2 rounded"
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-medium mb-1"
                    >
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      className="w-full border p-2 rounded"
                      value={formData.company}
                      onChange={handleInputChange}
                    />
                  </div>


                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full border p-2 rounded"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="w-full border p-2 rounded"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium mb-1"
                    >
                      Billing Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      className="w-full border p-2 rounded"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="address2"
                      className="block text-sm font-medium mb-1"
                    >
                      Billing Address 2 (Optional)
                    </label>
                    <input
                      type="text"
                      id="address2"
                      name="address2"
                      className="w-full border p-2 rounded"
                      value={formData.address2}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium mb-1"
                      >
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        className="w-full border p-2 rounded"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="postcode"
                        className="block text-sm font-medium mb-1"
                      >
                        Postcode
                      </label>
                      <input
                        type="text"
                        id="postcode"
                        name="postcode"
                        className="w-full border p-2 rounded"
                        value={formData.postcode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="invoiceAddress"
                      className="block text-sm font-medium mb-1 flex items-center justify-between"
                    >
                      Invoice Address
                      <button
                        type="button"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                        onClick={copyBillingToInvoice}
                      >
                        <Copy size={16} /> Use Billing Address
                      </button>
                    </label>
                    <input
                      type="text"
                      id="invoiceAddress"
                      name="invoiceAddress"
                      className="w-full border p-2 rounded"
                      value={formData.invoiceAddress}
                      onChange={handleInputChange}
                    />
                    {
                      isCopied && <>
                        <label
                          htmlFor="invoiceAddress"
                          className="text-pink-600 flex items-center gap-1 text-sm mt-1"
                        >
                          <CheckCircle size={14} />  Billing address copied
                        </label>
                      </>
                    }
                  </div>

                  <div>
                    <label
                      htmlFor="poNumber"
                      className="block text-sm font-medium mb-1"
                    >
                      PO Number (Optional)
                    </label>
                    <input
                      type="text"
                      id="poNumber"
                      name="poNumber"
                      className="w-full border p-2 rounded"
                      value={formData.poNumber}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="deliveryInstructions"
                      className="block text-sm font-medium mb-1"
                    >
                      Delivery Instructions
                    </label>
                    <textarea
                      id="deliveryInstructions"
                      name="deliveryInstructions"
                      rows={3}
                      className="w-full border p-2 rounded"
                      value={formData.deliveryInstructions}
                      onChange={handleInputChange}
                    />
                  </div>



                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-3 rounded text-white transition ${submitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                      }`}
                  >
                    {submitting ? "Confirming..." : "Confirm Order"}
                  </button>
                </form> :

                  <div className="space-y-4 bg-green-50 p-4 rounded border border-green-200">
                    <p className="text-green-700 font-semibold">
                      You have already confirmed this order.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[12px] font-medium text-gray-700">First Name</p>
                        <p>{data?.firstName}</p>
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-gray-700">Last Name</p>
                        <p>{data?.lastName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[12px] font-medium text-gray-700">Company</p>
                        <p>{data?.company}</p>
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-gray-700">Email</p>
                        <p>{data?.email}</p>
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-gray-700">Phone</p>
                        <p>{data?.phone}</p>
                      </div>
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[12px] font-medium text-gray-700">Billing Address</p>
                        <p>{data?.address}</p>
                      </div>
                      {data?.address2 && (
                        <div>
                          <p className="text-[12px] font-medium text-gray-700">Billing Address 2</p>
                          <p>{data?.address2}</p>
                        </div>
                      )}
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[12px] font-medium text-gray-700">City</p>
                        <p>{data?.city}</p>
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-gray-700">Postcode</p>
                        <p>{data?.postcode}</p>
                      </div>

                      <div>
                        <p className="text-[12px] font-medium text-gray-700">Invoice Address</p>
                        <p>{data?.invoiceAddress}</p>
                      </div>

                      {data?.poNumber && (
                        <div>
                          <p className="text-[12px] font-medium text-gray-700">PO Number</p>
                          <p>{data?.poNumber}</p>
                        </div>
                      )}
                    </div>


                    {data?.deliveryInstructions && (
                      <div>
                        <p className="text-[12px] font-medium text-gray-700">Delivery Instructions</p>
                        <p>{data?.deliveryInstructions}</p>
                      </div>
                    )}
                  </div>
              }

            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Review & Place Order
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                By confirming the order, the customer acknowledges acceptance of these Terms of Sale.
                <br /><br />

                <strong>Terms of Sale</strong><br /><br />

                <strong>Order Confirmation</strong><br />
                All orders must be formally confirmed by the customer, providing clear consent to proceed.
                Where a Purchase Order (PO) is required, it must be supplied prior to processing the order and arranging payment.
                <br /><br />

                <strong>Supplier Set-Up</strong><br />
                To ensure a smooth transaction, the customer should advise us of any supplier set-up requirements or processes—
                either prior to order confirmation or immediately thereafter.
                <br /><br />

                <strong>Returns Policy</strong><br />
                Orders, once processed, are non-returnable. We therefore request that customers review product codes and
                specifications carefully prior to confirming the order.
                <br /><br />

                <strong>Delivery Terms</strong><br />
                Orders will be processed and dispatched with next working day delivery as standard (unless otherwise requested),
                subject to stock availability and any unforeseen circumstances outside our control.
                <br /><br />

                <strong>Delivery & Invoicing Details</strong><br />
                At the time of order confirmation, the customer must provide and verify the correct delivery address and invoicing
                details, along with any specific delivery instructions where applicable.
                <br /><br />

                By placing this order, you agree to our{" "}
                <span
                  className="text-blue-600 underline cursor-pointer"
                  onClick={() => window.open("/terms", "_blank")}
                >
                  Terms & Conditions
                </span>
                . Please review your information carefully before proceeding.
              </p>

              <div className="flex items-start text-sm mb-4">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 mr-2"
                  checked={termsChecked}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="terms">
                  I agree to the Terms & Conditions.
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  className="flex-1 py-3 rounded text-gray-600 bg-gray-200 hover:bg-gray-300 transition"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  className={`flex-1 py-3 rounded text-white transition ${submitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                    }`}
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
