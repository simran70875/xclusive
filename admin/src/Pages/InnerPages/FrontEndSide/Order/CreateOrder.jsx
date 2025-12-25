import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const url = process.env.REACT_APP_API_URL;

const CreateNewOrder = () => {
  const adminToken = localStorage.getItem("token");
  const navigate = useNavigate();

  /* ---------------- CUSTOMER (RETAILER) ---------------- */
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });

  /* ---------------- PRODUCTS ---------------- */
  const [products, setProducts] = useState([]);
  const [productDetails, setProductDetails] = useState([]);

  useEffect(() => {
    console.log("productDetails ==> ", productDetails);
  }, [productDetails]);

  /* ---------------- PAYMENT ---------------- */
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [total, setTotal] = useState(0);
  const [paymentDueLater, setPaymentDueLater] = useState(false);

  /* ---------------- LOAD DATA ---------------- */
  const fetchCustomers = async () => {
    const res = await axios.get(`${url}/retailer/list`, {
      headers: { Authorization: adminToken },
    });
    setCustomers(res.data.data || []);
  };

  const fetchProducts = async () => {
    const res = await axios.get(`${url}/product/get`, {
      headers: { Authorization: adminToken },
    });

    setProducts(res.data.product || []);
  };

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

  /* ---------------- PAYMENT CALCULATION ---------------- */
  useEffect(() => {
    let sum = 0;
    productDetails.forEach((p) => {
      sum += p.qty * p.Product_Dis_Price;
    });
    setSubtotal(sum);
    setTotal(sum - discount + shipping);
  }, [productDetails, discount, shipping]);

  /* ---------------- CUSTOMER CREATE ---------------- */
  const createCustomer = async () => {
    const res = await axios.post(`${url}/retailer/create`, newCustomer, {
      headers: { Authorization: adminToken },
    });

    setSelectedCustomer(res.data.data);
    setCustomers((prev) => [...prev, res.data.data]);
    setShowCreateCustomer(false);
  };

  /* ---------------- PRODUCT ADD ---------------- */
  const addProduct = (product) => {
    setProductDetails([
      ...productDetails,
      {
        productId: product._id,
        name: product.Product_Name,
        Product_Dis_Price: product.Product_Dis_Price,
        qty: 1,
      },
    ]);
  };

  const updateQty = (index, qty) => {
    const updated = [...productDetails];
    updated[index].qty = qty;
    setProductDetails(updated);
  };

  /* ---------------- ORDER CREATE ---------------- */
  const createOrder = async (paymentType) => {
    const payload = {
      customerId: selectedCustomer?._id,
      products: productDetails,
      subtotal,
      discount,
      shipping,
      total,
      payment_status: paymentType === "paid" ? "Paid" : "Pending",
      payment_due_later: paymentDueLater,
    };

    await axios.post(`${url}/order/create`, payload, {
      headers: { Authorization: adminToken },
    });

    navigate("/showOrders");
  };

  /* ================= UI ================= */
  return (
    <div className="main-content dark">
      <div className="page-content">
        <div className="container-fluid">
          <h4 className="mb-3">Create New Order</h4>

          {/* ================= CUSTOMER ================= */}
          <div className="card mb-3">
            <div className="card-body">
              <h5>Customer</h5>

              {!selectedCustomer ? (
                <>
                  <select
                    className="form-control mb-2"
                    onChange={(e) =>
                      setSelectedCustomer(
                        customers.find((c) => c._id === e.target.value)
                      )
                    }
                  >
                    <option>Select existing customer</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>

                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setShowCreateCustomer(true)}
                  >
                    + Create new customer
                  </button>
                </>
              ) : (
                <p>
                  <b>{selectedCustomer.name}</b> — {selectedCustomer.email}
                </p>
              )}

              {showCreateCustomer && (
                <div className="mt-3">
                  <input
                    className="form-control mb-2"
                    placeholder="Name"
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, name: e.target.value })
                    }
                  />
                  <input
                    className="form-control mb-2"
                    placeholder="Email"
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, email: e.target.value })
                    }
                  />
                  <input
                    className="form-control mb-2"
                    placeholder="Phone"
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, phone: e.target.value })
                    }
                  />
                  <input
                    className="form-control mb-2"
                    placeholder="Company"
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        company: e.target.value,
                      })
                    }
                  />
                  <button className="btn btn-success" onClick={createCustomer}>
                    Save Customer
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ================= PRODUCTS ================= */}
          <div className="card mb-3">
            <div className="card-body">
              <h5>Products</h5>

              <select
                className="form-control mb-3"
                onChange={(e) =>
                  addProduct(products.find((p) => p._id === e.target.value))
                }
              >
                <option>Add product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.Product_Name} — £{p.Product_Dis_Price}
                  </option>
                ))}
              </select>

              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {productDetails.map((p, i) => (
                    <tr key={i}>
                      <td>{p.name}</td>
                      <td>
                        <input
                          type="number"
                          value={p.qty}
                          className="form-control"
                          onChange={(e) => updateQty(i, Number(e.target.value))}
                        />
                      </td>
                      <td>£{p.Product_Dis_Price}</td>
                      <td>£{p.qty * p.Product_Dis_Price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================= PAYMENT ================= */}
          <div className="card mb-3">
            <div className="card-body">
              <h5>Payment</h5>

              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <td>Subtotal</td>
                    <td className="text-end">£{subtotal}</td>
                  </tr>
                  <tr>
                    <td>Add discount</td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={discount}
                        onChange={(e) => setDiscount(+e.target.value || 0)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Add shipping</td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={shipping}
                        onChange={(e) => setShipping(+e.target.value || 0)}
                      />
                    </td>
                  </tr>
                  <tr className="fw-bold border-top">
                    <td>Total</td>
                    <td className="text-end">£{total}</td>
                  </tr>
                </tbody>
              </table>

              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={paymentDueLater}
                  onChange={(e) => setPaymentDueLater(e.target.checked)}
                />
                <label className="form-check-label">Payment due later</label>
              </div>

              <div className="mt-3 d-flex gap-2 justify-content-end">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => createOrder("invoice")}
                >
                  Send invoice
                </button>
                <button
                  className="btn btn-dark"
                  onClick={() => createOrder("paid")}
                >
                  Mark as paid
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewOrder;
