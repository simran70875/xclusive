import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
let url = process.env.REACT_APP_API_URL;

const CreateOrder = () => {
  const navigate = useNavigate();

  const adminToken = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [productData, setProductData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [addressDetails, setAddressDetails] = useState([]);
  const [couponDetails, setCouponDetails] = useState([]);

  const [OrderStatus, setOrderStatus] = useState();
  const [tracking_id, setTracking_id] = useState();
  const [reason, setReason] = useState("");
  const [paymentStatus, setPaymentStatus] = useState();
  const [paymentId, setPaymentId] = useState("");
  const [paymentType, setPaymentType] = useState();

  const [searchUser, setSearchUser] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [searchProduct, setSearchProduct] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [cartProducts, setCartProducts] = useState([]);

  const [shippingCharge, setShippingCharge] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [couponPrice, setCouponPrice] = useState(0);

  const [originalPrice, setOriginalPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  // get users
  useEffect(() => {
    async function getUser(page, pageSize) {
      setIsLoading(true);
      try {
        const res = await axios.get(`${url}/user/get`, {
          headers: {
            Authorization: `${adminToken}`,
          },
        });
        setUsers(res?.data?.user || []);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    }

    getUser();
  }, [adminToken]);

  //get products
  async function getProduct() {
    try {
      const res = await axios.get(`${url}/product/get`, {
        headers: {
          Authorization: `${adminToken}`,
        },
      });

      setProductData(res?.data?.product || []);

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getProduct();
  }, []);

  // for create OrderStatus
  const createOrderStatus = [
    "Pending",
    "Accepted",
    "Pick Up",
    "Rejected",
    "Delivered",
    "Cancelled",
    "Returned",
  ];

  useEffect(() => {
    if (!searchUser) {
      setFilteredUsers([]);
      return;
    }

    const filtered = users.filter(
      (u) =>
        u.User_Name?.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.User_Email?.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.User_Mobile_No?.includes(searchUser)
    );

    setFilteredUsers(filtered);
  }, [searchUser, users]);

  useEffect(() => {
    if (!searchProduct) {
      setFilteredProducts([]);
      return;
    }

    const filtered = productData.filter(
      (p) =>
        p.Product_Name?.toLowerCase().includes(searchProduct.toLowerCase()) ||
        p.SKU_Code?.toLowerCase().includes(searchProduct.toLowerCase())
    );

    setFilteredProducts(filtered);
  }, [searchProduct, productData]);

  const handleCreateOrder = async () => {
    if (!selectedUser || cartProducts.length === 0) {
      alert("Select user and product");
      return;
    }

    const payload = {
      userId: selectedUser._id,

      cartData: cartProducts.map((p) => ({
        product: p.product._id,
        variation: p.variation._id,
        SizeName: p.SizeName,
        Quantity: p.Quantity,
        price: p.price,
        totalPrice: p.price * p.Quantity,
      })),

      Address: addressDetails,

      OriginalPrice: originalPrice,
      Shipping_Charge: shippingCharge,
      is_Shipping_ChargeAdd: shippingCharge > 0,

      CouponPrice: couponPrice,
      FinalPrice: finalPrice,

      payment_mode: paymentType,
      payment_status: paymentStatus,
      PaymentId: paymentId,

      order_status: OrderStatus,
      reason,
    };

    await axios.post(`${url}/order/create/by-admin`, payload, {
      headers: { Authorization: adminToken },
    });

    navigate("/showOrders");
  };

  useEffect(() => {
    const subtotal = cartProducts.reduce(
      (sum, item) => sum + item.price * item.Quantity,
      0
    );

    setOriginalPrice(subtotal);
  }, [cartProducts]);

  useEffect(() => {
    const total =
      Number(originalPrice) + Number(shippingCharge) - Number(couponPrice);

    setFinalPrice(total > 0 ? total : 0);
  }, [originalPrice, shippingCharge, couponPrice]);

  return (
    <>
      <div className="main-content dark">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-2 table-heading">Create Orders</div>
              <div className="col-12 mt-2">
                <div className="card">
                  <div className="card-body">
                    <form>
                      <div className="mt-2">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-3"
                          style={{
                            color: "#AB8000",
                            textDecoration: "underline",
                          }}
                        >
                          User Details :
                        </label>

                        <div className="mb-3 row">
                          <label className="col-md-2 col-form-label">
                            Search User :-
                          </label>
                          <div className="col-md-10">
                            <input
                              className="form-control"
                              placeholder="Search by name / email / phone"
                              value={searchUser}
                              onChange={(e) => setSearchUser(e.target.value)}
                            />

                            {filteredUsers?.length > 0 && (
                              <ul className="list-group position-absolute w-50">
                                {filteredUsers?.map((u) => (
                                  <li
                                    key={u._id}
                                    className="list-group-item list-group-item-action"
                                    onClick={() => {
                                      setSelectedUser(u);
                                      setSearchUser("");
                                      setFilteredUsers([]);

                                      setAddressDetails(u?.Address || {});
                                    }}
                                    style={{ cursor: "pointer" }}
                                  >
                                    {u.User_Name} ({u.User_Email})
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>

                        <div className="mb-3 row">
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          >
                            User Name :-
                          </label>
                          <div className="col-md-10 mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={selectedUser?.User_Name}
                              className="form-control"
                              readOnly
                            />
                          </div>
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          >
                            Mobile Number :-
                          </label>
                          <div className="col-md-10 mt-1">
                            <input
                              type="text"
                              name="phone"
                              id="phone"
                              value={selectedUser?.User_Mobile_No}
                              className="form-control"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-2">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-3"
                          style={{
                            color: "#AB8000",
                            textDecoration: "underline",
                          }}
                        >
                          Delivery Details :
                        </label>
                        <div className="mb-3 row">
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          >
                            Type:-
                          </label>
                          <div className="col-md-10 mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={addressDetails?.Type}
                              className="form-control"
                              readOnly
                            />
                          </div>
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          >
                            {addressDetails?.Type} no :-
                          </label>
                          <div className="col-md-10 mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={addressDetails?.House}
                              className="form-control"
                              readOnly
                            />
                          </div>
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          >
                            Full Address:-
                          </label>
                          <div className="col-md-10 mt-1">
                            <textarea
                              type="text"
                              name="name"
                              id="name"
                              value={addressDetails?.Full_Address}
                              className="form-control"
                              readOnly
                            />
                          </div>
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          ></label>
                          <div className="col-md-4 mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={addressDetails?.City}
                              className="form-control"
                              readOnly
                            />
                          </div>
                          <div className="col-md-3 mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={addressDetails?.State}
                              className="form-control"
                              readOnly
                            />
                          </div>
                          <div className="col-md-3 mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={addressDetails?.Pincode}
                              className="form-control"
                              readOnly
                            />
                          </div>
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          >
                            Contact Number :-
                          </label>
                          <div className="col-md-4 mt-1">
                            <input
                              type="text"
                              name="phone"
                              id="phone"
                              value={addressDetails?.Phone_Number}
                              className="form-control"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group mt-3">
                        <label className="col-md-2 control-label">
                          Product details :-
                        </label>
                        <div className="col-md-12">
                          <div className="mb-3 row">
                            <label className="col-md-2 col-form-label">
                              Search Product :-
                            </label>
                            <div className="col-md-10">
                              <input
                                className="form-control"
                                placeholder="Search product / SKU"
                                value={searchProduct}
                                onChange={(e) =>
                                  setSearchProduct(e.target.value)
                                }
                              />

                              {filteredProducts.length > 0 && (
                                <ul className="list-group position-absolute w-75">
                                  {filteredProducts?.map((p) => (
                                    <li key={p._id} className="list-group-item">
                                      <b>{p.Product_Name}</b> ({p.SKU_Code})
                                      <br />
                                      {p.Variation?.map((v) => (
                                        <button
                                          key={v._id}
                                          className="btn btn-sm btn-outline-primary me-2 mt-1"
                                          onClick={() => {
                                            setCartProducts((prev) => [
                                              ...prev,
                                              {
                                                product: p,
                                                variation: v,
                                                SizeName:
                                                  v.Variation_Size?.[0]
                                                    ?.Size_Name,
                                                Quantity: 1,
                                                price:
                                                  v.Variation_Size?.[0]
                                                    ?.Size_Price,
                                              },
                                            ]);
                                            setSearchProduct("");
                                            setFilteredProducts([]);
                                          }}
                                        >
                                          {v.Variation_Name}
                                        </button>
                                      ))}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>

                          <table id="t01" style={{ width: "100%" }} border="1">
                            <tr>
                              <th>Product</th>
                              <th>SKU Code</th>
                              <th>Image</th>
                              <th>Color</th>
                              <th>Size</th>
                              <th>Quantity</th>
                              <th>Price</th>
                              <th>Total Price</th>
                            </tr>

                            {cartProducts &&
                              cartProducts?.map((product, index) => {
                                return (
                                  <tr key={index}>
                                    <td>
                                      {product?.product?.Product_Name?.slice(
                                        0,
                                        30
                                      ) + "..."}
                                    </td>
                                    <td>{product?.product?.SKU_Code}</td>
                                    <td>
                                      {
                                        <img
                                          src={product.variationImage}
                                          alt="Product Image"
                                          style={{
                                            width: "50px",
                                            height: "50px",
                                          }}
                                        />
                                      }
                                    </td>
                                    <td>
                                      {product?.variation?.Variation_Name}
                                    </td>
                                    <td>{product?.SizeName}</td>
                                    <td>{product?.Quantity}</td>
                                    <td>£ {product?.price}</td>
                                    <td>
                                      £ {product?.Quantity * product?.price}
                                    </td>
                                  </tr>
                                );
                              })}
                          </table>
                        </div>
                      </div>

                      <div className="form-group mt-3">
                        <label className="col-md-2 control-label">
                          Amount Details :-
                        </label>
                        <div className="col-md-12 orderDetailsTable">
                          <table id="t01" style={{ width: "100%" }} border="1">
                            <tr>
                              <th>Total Amount</th>
                              <th>Shipping Charges</th>
                              {couponDetails?.couponCode && (
                                <th>Coupon Details</th>
                              )}
                              <th>Final Amount</th>

                              <th>Payment Status</th>
                            </tr>
                            <tr>
                              <td>
                                <b>£ {originalPrice}/-</b>
                              </td>
                              <td>
                                <b> + £ {shippingCharge}/-</b>
                              </td>
                              {couponPrice > 0 && (
                                <td>
                                  #{couponCode} <br /> £ {couponPrice}
                                </td>
                              )}
                              <td>
                                <b>£ {finalPrice}/-</b>
                              </td>

                              <td>
                                <b>Payment Status : {paymentStatus}</b>
                              </td>
                            </tr>
                          </table>
                        </div>
                      </div>
                      <br />

                      <div className="mt-2">
                        <label
                          className="col-md-3"
                          style={{
                            color: "#AB8000",
                            textDecoration: "underline",
                          }}
                        >
                          Payment Details :
                        </label>

                        <div className="mb-3 row">
                          {/* Payment Mode */}
                          <label className="col-md-2 col-form-label">
                            Payment Type :-
                          </label>
                          <div className="col-md-10 mt-1">
                            <select
                              className="form-control"
                              value={paymentType}
                              onChange={(e) => setPaymentType(e.target.value)}
                            >
                              <option value="COD">COD</option>
                              <option value="ONLINE">Online</option>
                              <option value="BANK">Bank Transfer</option>
                            </select>
                          </div>

                          {/* Payment Status */}
                          <label className="col-md-2 col-form-label">
                            Payment Status :-
                          </label>
                          <div className="col-md-10 mt-1">
                            <select
                              className="form-control"
                              value={paymentStatus}
                              onChange={(e) => setPaymentStatus(e.target.value)}
                            >
                              <option value="Unpaid">Unpaid</option>
                              <option value="Paid">Paid</option>
                              <option value="Failed">Failed</option>
                            </select>
                          </div>

                          {/* Payment ID */}
                          <label className="col-md-2 col-form-label">
                            Payment ID :-
                          </label>
                          <div className="col-md-10 mt-1">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Transaction ID / Ref No"
                              value={paymentId}
                              onChange={(e) => setPaymentId(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-2">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-3"
                          style={{
                            color: "#AB8000",
                            textDecoration: "underline",
                          }}
                        >
                          Order Status :
                        </label>

                        <div className="mb-3 row">
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          >
                            Order Status :-
                          </label>
                          <div className="col-md-10 mt-1">
                            <select
                              name="o_type"
                              id="o_type"
                              style={{ width: "30%", height: "100%" }}
                              className="select2"
                              value={OrderStatus}
                              onChange={(e) => setOrderStatus(e.target.value)}
                              required
                            >
                              <option value="">Select Status</option>
                              {createOrderStatus?.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </div>

                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          >
                            Reason :-
                          </label>
                          <div className="col-md-10 mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              className="form-control"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-10">
                        <div className="col ms-auto">
                          <div className="d-flex flex-reverse flex-wrap gap-2">
                            <a
                              className="btn btn-danger"
                              onClick={() => navigate("/showOrders")}
                            >
                              {" "}
                              <i className="fas fa-window-close"></i> Cancel{" "}
                            </a>

                            <a
                              className="btn btn-success"
                              onClick={handleCreateOrder}
                            >
                              <i className="fas fa-save"></i> Save{" "}
                            </a>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateOrder;
