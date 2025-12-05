/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  HomeOutlined,
  InsertRowLeftOutlined,
  ProjectOutlined,
  DeleteTwoTone,
  EditTwoTone,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Col,
  Form,
  Image,
  Input,
  Modal,
  Popconfirm,
  Radio,
  Row,
} from "antd";

import {
  addAddressApi,
  deleteAddressApi,
  geAddressApi,
  updateAddressApi,
} from "../../Features/Address/Address";
import {
  addCouponCodeApi,
  getCouponCodeApi,
} from "../../Features/Setting/Setting";
import { routes } from "../../Routes/Routes";
import cash from "../../Assets/PNG/cash.png";
import TextArea from "antd/es/input/TextArea";
import arrow from "../../Assets/PNG/arrow.png";
import wallet from "../../Assets/PNG/wallet.png";
import online from "../../Assets/PNG/online.png";
import delivery from "../../Assets/PNG/delivery.png";
import { addOrderApi } from "../../Features/Order/Order";
import {
  // addPaymentApi,
  geCartListApi,
  // getPaymentApi,
} from "../../Features/AddCart/AddCart";
import { getProfileApi } from "../../Features/User/User";

import styles from "./index.module.scss";
import axios from "axios";
import { apiUrl } from "../../Constant";

function Summery() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [Add, setAdd] = useState();
  const [editId, setEditId] = useState("");
  const [couponCode, setCouponCode] = useState();
  const [addType, setAddType] = useState("");
  const [payType, setPayType] = useState("");
  const [couponId, setCouponId] = useState();
  const [isEdit, setIsEdit] = useState(false);
  const [ordertype, setOrdertype] = useState("");
  const [ordertype2, setOrdertype2] = useState("0");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalCoupon, setIsModalCoupon] = useState(false);
  const [couponName, setCouponName] = useState("");
  const [couponPrice, setCouponPrice] = useState(0);
  const [indexSelect, setIndexSelect] = useState(0);
  const [indexSelect2, setIndexSelect2] = useState("wallet");
  const [quienty, setQuienty] = useState(1);
  const addressList = useSelector((state) => state.address?.addressData);
  const userToken = useSelector((state) => state.user?.token);
  const cartlist = useSelector((state) => state.addCart?.cartListData);
  const profileData = useSelector((state) => state.user?.profileData);
  const couponListData = useSelector((state) => state.setting?.couponCodeData);
  const loader = useSelector((state) => state.addCart?.isAddCartLoad);
  const loaderAddress = useSelector((state) => state.address?.isAddressLoading);
  const loaderCoupon = useSelector((state) => state.setting?.settingLoading);
  const applyCoupon = useSelector((state) => state.setting?.couponData);
  // const paymentData = useSelector((state) => state.addCart?.paymentData);

  const [useWallet, setUseWallet] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (
      profileData?.User_Type === "1" ||
      profileData?.User_Type === "2" ||
      profileData?.User_Type === "3"
    ) {
      setOrdertype("online");
      setOrdertype2("1");
      setPayType("online");
      setIndexSelect2("online");
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    dispatch(geAddressApi(userToken));
    dispatch(geCartListApi(userToken));
    dispatch(getProfileApi(userToken));
    dispatch(getCouponCodeApi(userToken));
    let qty = 0;
    cartlist?.cartItems.forEach((x) => {
      qty += x.Quantity;
    });
    setQuienty(qty);
  }, [quienty, couponPrice, applyCoupon]);

  const handleAddreesRemove = (item) => {
    dispatch(deleteAddressApi(item?._id, userToken));
  };

  const handleAddressUpdate = (item) => {
    setEditId(item._id);
    form.setFieldsValue({
      name: item.Name,
      housenumber: item.House,
      landmark: item.landmark,
      address: item.Full_Address,
      state: item.State,
      city: item.City,
      pincode: item.Pincode,
    });
    setAddType(item.Type);
    setIsModalOpen(true);
    setIsEdit(true);
  };

  const handleAddressSubmit = (value) => {
    const values = {
      Type: addType,
      Phone_Number: value.Phone_Number,
      Name: value.name,
      landmark: value.landmark,
      Full_Address: value.address,
      House: value.housenumber,
      State: value.state,
      City: value.city,
      Pincode: value.pincode,
    };
    const onSuccessCallback = () => {
      dispatch(geAddressApi(userToken));
      form.resetFields();
      setIsModalOpen(false);
      setIsEdit(false);
      setAddType("");
      setEditId("");
    };
    if (isEdit)
      dispatch(updateAddressApi(values, userToken, editId, onSuccessCallback));
    else dispatch(addAddressApi(values, userToken, onSuccessCallback));
  };

  const handleAddressType = (addressType) => {
    setAddType(addressType);
  };

  const handlePaymentType = (paymentType) => {
    setPayType(paymentType);
    setIndexSelect2(paymentType);
    if (paymentType === "cash") {
      setCouponName("");
      setCouponPrice(0);
      let qty = 0;
      cartlist?.cartItems.forEach((x) => {
        qty += x.Quantity;
      });
      setQuienty(qty);
    }
    switch (paymentType) {
      case "wallet":
        setOrdertype("wallet");
        setOrdertype2("0");
        break;

      case "online":
        setOrdertype("online");
        setOrdertype2("1");
        break;

      case "cash":
        setOrdertype("cash");
        setOrdertype2("2");
        break;

      default:
        break;
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    // setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setIsEdit(false);
    setAddType("");
    setEditId("");
  };

  const showModalCoupon = () => {
    setIsModalCoupon(true);
  };

  const handleOkCoupon = (name, price, item) => {
    setCouponId(item?._id);
    setCouponName(name);
    setCouponPrice(price);
    setIsModalCoupon(false);
  };

  const handleCancelCoupon = () => {
    setIsModalCoupon(false);
  };

  const TotalAmount = () => {
    if (ordertype === "cash" || applyCoupon?.[0]?.discountAmount) {
      return Number(cartlist?.totalAmount) - quienty * 100;
    }

    if (couponPrice && useWallet === true) {
      const remainingAmount =
        Number(cartlist?.totalAmount) -
        (Number(couponPrice) * quienty + profileData?.Wallet);
      return remainingAmount <= 0 ? 0 : remainingAmount;
    } else if (couponPrice) {
      return Number(cartlist?.totalAmount) - Number(couponPrice) * quienty;
    } else if (useWallet === true) {
      const remainingAmount =
        Number(cartlist?.totalAmount) - profileData?.Wallet;
      return remainingAmount <= 0 ? 0 : remainingAmount;
    } else {
      return Number(cartlist?.totalAmount);
    }
  };

  // useEffect(() => {
  //   const amount = TotalAmount();
  //   if (isNaN(amount)) {
  //     navigate("/");
  //   }
  // },[cartlist, couponPrice, useWallet, applyCoupon, quienty, profileData, ordertype, navigate])

  const handleSubmit = async () => {
    if (profileData?.User_Type === "1" || profileData?.User_Type === "2") {
      setOrdertype("online");
      setOrdertype2("1");
    }
    if (profileData?.Wallet < 2000 && profileData?.User_Type === "1") {
      return setError(
        "A minimum wallet balance of 2000 is required to place an order."
      );
    } else if (profileData?.Wallet < 100 && profileData?.User_Type === "2") {
      return setError(
        "A minimum wallet balance of 100 is required to place an order."
      );
    }

    let qty = 0;
    cartlist?.cartItems.forEach((x) => {
      qty += x.Quantity;
    });
    setQuienty(qty);
    const obj = {
      Coupon: couponId ? couponId : "",
      device: "web",
      CouponPrice: couponPrice
        ? couponPrice * quienty
        : applyCoupon?.[0]?.discountAmount
        ? applyCoupon?.[0]?.discountAmount * quienty
        : 0,
      reason: "",
      PaymentType: ordertype2 ? ordertype2 : "0",
      FinalPrice: couponPrice
        ? Number(cartlist?.totalAmount) - Number(couponPrice) * Number(quienty)
        : couponPrice === 0
        ? Number(cartlist?.totalAmount)
        : applyCoupon?.[0]?.discountAmount
        ? Number(cartlist?.totalAmount) -
          Number(applyCoupon?.[0]?.discountAmount) * Number(quienty)
        : Number(cartlist?.totalAmount),
      DiscountPrice: Number(cartlist?.totalDiscount),
      OriginalPrice: Number(cartlist?.totalOriginalAmount),
      Address: Add?._id ? Add?._id : addressList?.[0]?._id,
      OrderType: "9",
      Shipping_Charge: Number(cartlist?.ShippingCharge),
      Quantity: Number(qty),
    };

    const onSuccessDirectCallback = (response) => {
      const orderDetails = response.data; // Assuming `response.data` contains the order details
      navigate(routes.thankyouUrl, {
        state: { orderId: orderDetails.orderId },
      });
      toast.success(response.message);
    };

    if (Add?._id ? Add?._id : addressList?.[0]?._id) {
      if (ordertype === "wallet" || indexSelect2 === "wallet") {
        if (profileData?.Wallet >= cartlist?.totalAmount) {
          const wallet_order_obj = {
            ...obj,
            OrderType: "1",
            payment_status: "Paid",
            wallet: true,
            walletAmount: obj.FinalPrice,
          };
          dispatch(
            addOrderApi(wallet_order_obj, onSuccessDirectCallback, userToken)
          );
        } else {
          toast.error(
            "Your wallet’s balance is insufficient to proceed payment "
          );
        }
      } else if (ordertype === "cash") {
        const totalamt = quienty * 100;
        let cod_data_obj = { ...obj, cod_advance_amt: totalamt };

        if (useWallet === true && profileData?.Wallet !== 0) {
          const final_cod_amt = totalamt - profileData?.Wallet;

          if (final_cod_amt <= 0) {
            cod_data_obj = {
              ...obj,
              OrderType: "1",
              // PaymentType:"0",
              // payment_status: "Paid",
              cod_advance_amt: totalamt,
              FinalAdavnceCodPrice: 0,
              wallet: true,
              walletAmount: totalamt,
              cod_status: "Paid",
              ActualPayment: 0,
            };
            const ordersss = dispatch(
              addOrderApi(cod_data_obj, onSuccessDirectCallback, userToken)
            );
            console.log("cod order details ==>", ordersss);
          } else {
            cod_data_obj = {
              ...obj,
              cod_advance_amt: totalamt,
              FinalAdavnceCodPrice: final_cod_amt,
              wallet: true,
              walletAmount: profileData?.Wallet,
            };
            handlePayment(cod_data_obj, userToken, final_cod_amt);
          }
        } else if (useWallet === false) {
          cod_data_obj = {
            ...obj,
            cod_advance_amt: totalamt,
            FinalAdavnceCodPrice: totalamt,
            wallet: false,
          };
          handlePayment(cod_data_obj, userToken, totalamt);
        }

        // dispatch(getPaymentApi(cartlist?.totalAmount));
      } else if (ordertype === "online") {
        const amt = TotalAmount();
        let online_data_obj = { ...obj, cod_advance_amt: amt };

        // payment through wallet or use coupen
        if (useWallet === true && profileData?.Wallet !== 0) {
          if (amt <= 0) {
            online_data_obj = {
              ...obj,
              OrderType: "1",
              // PaymentType: "0",
              payment_status: "Paid",
              wallet: true,
              walletAmount: obj.FinalPrice,
              ActualPayment: 0,
            };

            console.log("online_data_obj ==", online_data_obj);
            dispatch(
              addOrderApi(online_data_obj, onSuccessDirectCallback, userToken)
            );
          } else {
            online_data_obj = {
              ...obj,
              wallet: true,
              walletAmount: profileData?.Wallet,
            };
            handlePayment(online_data_obj, userToken, amt);
          }
        } else if (couponPrice && useWallet === true) {
          if (amt <= 0) {
            online_data_obj = {
              ...obj,
              OrderType: "1",
              paymentType: "0",
              payment_status: "Paid",
              Coupon: couponId,
              // CouponPrice: couponPrice * quienty,
              wallet: true,
              walletAmount: online_data_obj.FinalPrice - couponPrice,
            };
            dispatch(
              addOrderApi(online_data_obj, onSuccessDirectCallback, userToken)
            );
          } else {
            online_data_obj = {
              ...obj,
              Coupon: couponId,
              // CouponPrice: couponPrice * quienty,
              wallet: true,
            };
            handlePayment(online_data_obj, userToken, amt);
          }
        } else if (couponPrice) {
          if (amt <= 0) {
            online_data_obj = {
              ...obj,
              payment_status: "Paid",
              Coupon: couponId,
              // CouponPrice: couponPrice * quienty,
            };
            dispatch(
              addOrderApi(online_data_obj, onSuccessDirectCallback, userToken)
            );
          } else {
            online_data_obj = {
              ...obj,
              Coupon: couponId,
              // CouponPrice: couponPrice * quienty,
            };
            handlePayment(online_data_obj, userToken, amt);
          }
        } else {
          handlePayment(obj, userToken, cartlist?.totalAmount);
        }
      }
    } else {
      toast.error("address or payment  method required");
    }
  };

  const handlePayment = async (orderInfo, userToken, amount) => {
    console.log("amount ==>", amount, apiUrl.GET_PAYMENT_GETWAY);
    try {
      const response = await axios.post(
        `${apiUrl.GET_PAYMENT_GETWAY}?amounts=${amount}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const jsonResponse = response.data;
      console.log("Payment initiation response:", jsonResponse);
      if (jsonResponse.status === "NEW") {
        const PaymentId = response.data.id;
        const ActualPayment = Number(response.data.sdk_payload.payload.amount);
        const orderId = response.data.order_id;

        orderInfo = { ...orderInfo, orderId, PaymentId, ActualPayment };
        console.log("orderInfo ==>", orderId, orderInfo);

        const onSuccessCallback = () => {
          const url = jsonResponse.payment_links.web;
          console.log("Redirecting to:", url);
          window.location.href = url;
          // navigate(routes.thankyouUrl);
          // dispatch(setCartCount(0));
        };

        const newordercod = dispatch(
          addOrderApi(orderInfo, onSuccessCallback, userToken)
        );
        console.log("newordercod ==>", newordercod);
      } else {
        console.error("Payment initiation failed:", jsonResponse.message);
      }
    } catch (error) {
      if (error.response) {
        // The request was made, and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(
          "Error initiating payment:",
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        // The request was made, but no response was received
        console.error("No response received:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error:", error.message);
      }
    }
  };

  const handleChange = (e, index) => {
    setAdd(e);
    setIndexSelect(index);
  };

  const handleCouponCode = () => {
    const obj = {
      couponCode: couponCode,
    };
    const onSuccessCallback = () => {};
    dispatch(addCouponCodeApi(obj, onSuccessCallback, userToken));
  };

  const handleRemoveCoupon = () => {
    setCouponName("");
    setCouponPrice(0);
  };

  const cancel = (e) => {};

  return (
    <div>
      <Row justify="center">
        <Col xs={22} md={22} lg={22} xl={22} xxl={22}>
          <Row className={styles.main}>
            <Col
              xs={24}
              md={24}
              lg={24}
              xl={15}
              xxl={15}
              className={styles.shopping}
            >
              <div>
                <div className={styles.main2}>
                  <p className={styles.cart}>Select Your Address</p>
                  <div className={styles.product}>
                    <p>Preference</p>
                    <div>
                      <p>Name/ph. no.</p>
                      <p>Address</p>
                    </div>
                  </div>
                  <div className={styles.blank}></div>
                  {addressList?.map((item, index) => (
                    <>
                      <div className={styles.setitem} key={index}>
                        <div>
                          <div className={styles.showItem}>
                            <Radio
                              className={styles.radio}
                              // checked={item?._id === Add?._id}
                              checked={index === indexSelect}
                              // onClick={() => setAdd(item)}
                              onChange={() => handleChange(item, index)}
                            />
                            <div className={styles.add}>
                              <p>{item?.Type}</p>
                            </div>
                            <div className={styles.tailor}>
                              <p className={styles.arpit}>{item?.Name}</p>
                              <p className={styles.no}>{item?.Phone_Number}</p>
                            </div>
                            <div className={styles.address}>
                              {item?.Full_Address}
                            </div>
                            <div className={styles.seticons}>
                              <Popconfirm
                                title="Are you sure you want to delete?"
                                onConfirm={() => handleAddreesRemove(item)}
                                onCancel={cancel}
                                okText="Yes"
                                cancelText="No"
                              >
                                <DeleteTwoTone
                                  twoToneColor="red"
                                  className={styles.delete}
                                />
                              </Popconfirm>
                              <EditTwoTone
                                className={styles.edit}
                                onClick={() => handleAddressUpdate(item)}
                              />
                            </div>
                          </div>
                          <div className={styles.address0}>
                            {item?.Full_Address}
                          </div>
                        </div>
                      </div>
                    </>
                  ))}
                  <div className={styles.continue}>
                    <Button className={styles.addaddress} onClick={showModal}>
                      ADD ADDRESS
                    </Button>
                  </div>

                  <>
                    <div className={styles.payment}>
                      <p>Choose your Payment Method</p>
                    </div>
                    <div className={styles.method}>
                      {profileData?.User_Type === "0" ? (
                        <div className={styles.choose}>
                          <Radio
                            className={styles.radio2}
                            value={"wallet"}
                            defaultChecked={true}
                            checked={indexSelect2 === "wallet"}
                            onChange={() => handlePaymentType("wallet")}
                          />
                          <Image
                            preview={false}
                            src={wallet}
                            alt="wallet"
                            className={styles.wallet}
                          />
                          <p className={styles.thousand}>
                            Wallet - ₹{profileData?.Wallet}
                          </p>
                        </div>
                      ) : null}

                      <div className={styles.choose}>
                        <Radio
                          className={styles.radio2}
                          value={"online"}
                          checked={ordertype === "online"}
                          onChange={() => handlePaymentType("online")}
                          // disabled
                        />
                        <Image
                          preview={false}
                          src={online}
                          alt="online"
                          className={styles.wallet}
                        />
                        <p className={styles.thousand}>Online Payment</p>
                      </div>

                      {profileData?.User_Type === "0" ? (
                        <div className={styles.choose}>
                          <Radio
                            className={styles.radio2}
                            value={"cash"}
                            checked={ordertype === "cash"}
                            onChange={() => handlePaymentType("cash")}
                            // disabled
                          />
                          <Image
                            preview={false}
                            src={cash}
                            alt="cash"
                            className={styles.wallet}
                          />
                          <p className={styles.thousand}>Cash on Delivery</p>
                        </div>
                      ) : null}
                    </div>
                  </>
                </div>
              </div>
            </Col>
            <Col
              xs={24}
              md={16}
              lg={12}
              xl={8}
              xxl={8}
              className={styles.main3}
            >
              <div>
                <div className={styles.order}>
                  <p>Your Order Summary</p>
                  <div className={styles.blank3}></div>
                  {cartlist?.cartItems?.map((item, index) => (
                    <>
                      <div key={index}>
                        <Image
                          preview={false}
                          src={item?.Variation?.variation_Image}
                          alt="wear1"
                        />
                        <div className={styles.setside}>
                          <p className={styles.boota}>
                            {item?.Product?.product_Name}
                          </p>
                          <p className={styles.size}>Size - {item?.SizeName}</p>
                          <p className={styles.size}>
                            Quantity - {item?.Quantity}
                          </p>
                        </div>
                        <div className={styles.prices}>
                          <p className={styles.price1}>
                            ₹{item?.discountPrice}
                          </p>
                          <span className={styles.price2}>
                            ₹{item?.originalPrice}
                          </span>
                        </div>
                      </div>
                    </>
                  ))}
                  <div className={styles.delivery}>
                    <Image preview={false} src={delivery} alt="delivery" />
                    <p className={styles.business}>
                      Estimated delivery by 5 to 7 business days
                    </p>
                  </div>
                  <div className={styles.code}>
                    <div className={styles.enter}>
                      <Input
                        placeholder="Enter coupon code"
                        className={styles.coding}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <div className={styles.blank4}></div>
                      {ordertype === "cash" ||
                      couponName ||
                      applyCoupon?.length > 0 ? (
                        <p className={styles.explore}>
                          Don’t have any, Explore here...
                        </p>
                      ) : (
                        <p className={styles.explore} onClick={showModalCoupon}>
                          Don’t have any, Explore here...
                        </p>
                      )}
                      <p
                        className={
                          couponName ? styles.explore2 : styles.explore3
                        }
                      >
                        {couponName ? couponName : ""}
                        <span onClick={() => handleRemoveCoupon()}>
                          {couponName ? "remove" : ""}
                        </span>
                      </p>
                    </div>
                    <div className={couponName ? styles.enter3 : styles.enter2}>
                      <Button
                        className={styles.apply}
                        onClick={() => handleCouponCode()}
                        loading={loaderCoupon}
                        disabled={ordertype === "cash" || couponName}
                      >
                        Apply
                      </Button>
                      {ordertype === "cash" ||
                      couponName ||
                      applyCoupon?.length > 0 ? (
                        <Image
                          preview={false}
                          src={arrow}
                          alt="arrow"
                          className={styles.arrow}
                        />
                      ) : (
                        <Image
                          preview={false}
                          src={arrow}
                          alt="arrow"
                          className={styles.arrow}
                          onClick={showModalCoupon}
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <p>Total MRP</p>
                    <div className={styles.pro}>
                      <p className={styles.pro1}>₹{cartlist?.totalDiscount}</p>
                      <span className={styles.pro2}>
                        ₹{cartlist?.totalOriginalAmount}
                      </span>
                    </div>
                  </div>
                  <div className={styles.coupon}>
                    <p className={styles.coupon1} style={{ color: "black" }}>
                      Shipping Charge
                    </p>
                    <p className={styles.coupon2} style={{ color: "black" }}>
                      ₹{cartlist?.ShippingCharge ? cartlist?.ShippingCharge : 0}
                    </p>
                  </div>
                  {ordertype === "cash" ? (
                    ""
                  ) : (
                    <div className={styles.coupon}>
                      {applyCoupon?.[0]?.discountAmount ? (
                        <>
                          <p className={styles.coupon1}>Coupon Discount</p>
                          <p className={styles.coupon2}>
                            ₹
                            {applyCoupon?.[0]?.discountAmount
                              ? applyCoupon?.[0]?.discountAmount * quienty
                              : 0}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className={styles.coupon1}>Coupon Discount</p>
                          <p className={styles.coupon2}>
                            ₹
                            {couponPrice
                              ? couponPrice * quienty
                              : couponName === ""
                              ? 0
                              : 0}
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {profileData?.Wallet > 0 &&
                    (ordertype === "cash" || ordertype === "online") && (
                      <div className={styles.coupon}>
                        <input
                          value="test"
                          type="checkbox"
                          onChange={(e) => {
                            setUseWallet(e.target.checked);
                          }}
                        />

                        <p className={styles.thousand}>
                          Use money from wallet ₹{profileData?.Wallet}
                        </p>
                        {/* <br></br> */}
                        {/* <p> */}
                        {/* {useWallet === true ? `Remainig Wallet Amount : ${profileData?.Wallet - TotalAmount()}` : null} */}
                        {/* </p> */}
                      </div>
                    )}

                  <div className={styles.blank3}></div>
                  <div style={{ margin: 0 }} className={styles.amount}>
                    <p className={styles.amount1}>Total Amount</p>
                    <p className={styles.amount2}>
                      ₹ {TotalAmount()}
                      {/* {applyCoupon?.[0]?.discountAmount && Number(cartlist?.totalAmount) - Number(applyCoupon?.[0]?.discountAmount) * Number(quienty)} */}
                    </p>
                  </div>
                  {ordertype === "cash" && (
                    <>
                      <div style={{ padding: 0 }} className={styles.coupon}>
                        <p className={styles.coupon1}>Advance Payment</p>
                        <p className={styles.coupon2}>
                          {useWallet === true ? quienty * 100 - profileData?.Wallet <= 0
                              ? 0
                              : `${quienty * 100 - profileData?.Wallet}`
                            : `₹${quienty * 100}`}
                        </p>
                      </div>
                    </>
                  )}
                  <Button
                    onClick={() => handleSubmit()}
                    className={styles.proced}
                    loading={loader}
                  >
                    PLACE ORDER
                  </Button>
                  <p style={{ fontSize: 14, color: "red" }}>{error}</p>
                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
      <Modal open={isModalCoupon} onCancel={handleCancelCoupon} footer={null}>
        <Row justify="center">
          <Col xl={23} xxl={23} className={styles.setcoupon}>
            <p className={styles.settext}>Apply Coupon</p>
            {couponListData?.length > 0 ? (
              <>
                {couponListData?.map((item, index) => (
                  <>
                    <div className={styles.couponset} key={index}>
                      <div className={styles.firstset}>
                        <p className={styles.for}>{item?.couponCode}</p>
                        <Button
                          disabled={item?.usageCount >= item?.usageLimits}
                          className={styles.app}
                          onClick={() => {
                            handleOkCoupon(
                              item?.couponCode,
                              item?.discountAmount,
                              item
                            );
                          }}
                        >
                          APPLY
                        </Button>
                      </div>
                      <div className={styles.blanking}></div>
                      <p className={styles.discou}>
                        Discount ₹{item?.discountAmount}
                      </p>
                    </div>
                  </>
                ))}
              </>
            ) : (
              <>
                <p
                  style={{
                    fontSize: "20px",
                    textAlign: "center",
                  }}
                >
                  No Coupon Found!
                </p>
              </>
            )}
          </Col>
        </Row>
      </Modal>
      <Modal open={isModalOpen} onCancel={handleCancel} footer={null}>
        <Row justify="center">
          <Col
            xs={24}
            md={22}
            lg={22}
            xl={22}
            xxl={22}
            className={styles.setmodal}
          >
            <p>{isEdit ? "Edit" : "Add"} Address</p>
            <Form
              onFinish={handleAddressSubmit}
              form={form}
              name="address-form"
              autoComplete="false"
            >
              <Form.Item
                name="name"
                className={styles.name}
                rules={[{ required: true, message: "" }]}
              >
                <Input placeholder="Name" />
              </Form.Item>
              <Form.Item
                name="housenumber"
                className={styles.name}
                rules={[{ required: true, message: "" }]}
              >
                <Input placeholder="House number / street / Area" />
              </Form.Item>
              <Form.Item
                name="landmark"
                className={styles.name}
                rules={[{ required: true, message: "" }]}
              >
                <Input placeholder="Landmark" />
              </Form.Item>
              <Form.Item
                name="Phone_Number"
                className={styles.name}
                rules={[{ required: true, message: "" }]}
              >
                <Input type="number" placeholder="Enter Phone Number" />
              </Form.Item>
              <Form.Item
                name="address"
                className={styles.name}
                rules={[{ required: true, message: "" }]}
              >
                <TextArea placeholder="Address" />
              </Form.Item>
              <Form.Item
                name="state"
                className={styles.name}
                rules={[{ required: true, message: "" }]}
              >
                <Input placeholder="state" />
              </Form.Item>
              <Form.Item
                name="city"
                className={styles.name}
                rules={[{ required: true, message: "" }]}
              >
                <Input placeholder="city" />
              </Form.Item>
              <Form.Item
                name="pincode"
                className={styles.name}
                rules={[{ required: true, message: "" }]}
              >
                <Input type="number" placeholder="pincode" />
              </Form.Item>
              <div className={styles.home}>
                <Form.Item className={styles.homebtn1}>
                  <Button
                    icon={<HomeOutlined />}
                    className={
                      addType === "Home" ? styles.homebtn : styles.homebtn2
                    }
                    onClick={() => handleAddressType("Home")}
                  >
                    HOME
                  </Button>
                </Form.Item>
                <Form.Item className={styles.homebtn1}>
                  <Button
                    icon={<InsertRowLeftOutlined />}
                    className={
                      addType === "Work" ? styles.homebtn : styles.homebtn2
                    }
                    onClick={() => handleAddressType("Work")}
                  >
                    WORK
                  </Button>
                </Form.Item>
                <Form.Item className={styles.homebtn1}>
                  <Button
                    icon={<ProjectOutlined />}
                    className={
                      addType === "Other" ? styles.homebtn : styles.homebtn2
                    }
                    onClick={() => handleAddressType("Other")}
                  >
                    OTHER
                  </Button>
                </Form.Item>
              </div>
              <Form.Item className={styles.mainbtn}>
                <Button
                  htmlType="submit"
                  onClick={handleOk}
                  className={styles.save}
                  loading={loaderAddress}
                >
                  SAVE
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Modal>
    </div>
  );
}

export default Summery;
