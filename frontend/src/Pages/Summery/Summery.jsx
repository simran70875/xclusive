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
import TextArea from "antd/es/input/TextArea";
import arrow from "../../Assets/PNG/arrow.png";
import { addOrderApi } from "../../Features/Order/Order";
import { geCartListApi } from "../../Features/AddCart/AddCart";
import { getProfileApi } from "../../Features/User/User";

import styles from "./index.module.scss";
import axios from "axios";
import { apiUrl } from "../../Constant";

function Summery() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const addressList = useSelector((state) => state.address?.addressData);
  const userToken = useSelector((state) => state.user?.token);
  const cartlist = useSelector((state) => state.addCart?.cartListData);
  const profileData = useSelector((state) => state.user?.profileData);
  const couponListData = useSelector((state) => state.setting?.couponCodeData);
  const loader = useSelector((state) => state.addCart?.isAddCartLoad);
  const loaderAddress = useSelector((state) => state.address?.isAddressLoading);
  const loaderCoupon = useSelector((state) => state.setting?.settingLoading);
  const applyCoupon = useSelector((state) => state.setting?.couponData);

  const [Add, setAdd] = useState();
  const [editId, setEditId] = useState("");
  const [couponCode, setCouponCode] = useState();
  const [addType, setAddType] = useState("");
  const [couponId, setCouponId] = useState();
  const [isEdit, setIsEdit] = useState(false);
  const [ordertype, setOrdertype] = useState("cash");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalCoupon, setIsModalCoupon] = useState(false);
  const [couponName, setCouponName] = useState("");
  const [couponPrice, setCouponPrice] = useState(0);
  const [indexSelect, setIndexSelect] = useState(0);
  const [quienty, setQuienty] = useState(1);

  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(geAddressApi(userToken));
    dispatch(geCartListApi(userToken));
    dispatch(getProfileApi(userToken));
    dispatch(getCouponCodeApi(userToken));
    // let qty = 0;
    // cartlist?.cartItems.forEach((x) => {
    //   qty += x.Quantity;
    // });
    // setQuienty(qty);
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
    // if (applyCoupon?.[0]?.discountAmount) {
    //   return Number(cartlist?.totalAmount) - quienty * 100;
    // }

    console.log("couponPrice", couponPrice, applyCoupon);

    if (couponPrice) {
      return Number(cartlist?.totalAmount) - Number(couponPrice);
    } else {
      return Number(cartlist?.totalAmount);
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

  const handleSubmit = async () => {
    let totalQty = 0;

    console.log("cart list ", cartlist)

    cartlist?.cartItems?.forEach((item) => {
      totalQty += item.Quantity;
    });

    const addressId = Add?._id || addressList?.[0]?._id;

    if (!addressId) {
      toast.error("Please select delivery address");
      return;
    }

    const payload = {
      Coupon: couponId || "",
      CouponPrice: couponPrice
        ? Number(couponPrice) * totalQty
        : applyCoupon?.[0]?.discountAmount
        ? Number(applyCoupon?.[0]?.discountAmount) * totalQty
        : 0,

      OriginalPrice: Number(cartlist?.totalOriginalAmount),
      DiscountPrice: Number(cartlist?.totalDiscount),
      Shipping_Charge: Number(cartlist?.ShippingCharge || 0),
      FinalPrice: Number(cartlist?.totalAmount),

      Address: addressId,

      // Manual payment handled by admin
      payment_mode: "COD",
      order_status: "Pending",
      reason: "",
    };

    const onSuccessCallback = (response) => {
      toast.success(response.message);
      navigate(routes.thankyouUrl, {
        state: { orderId: response.data.orderId },
      });
    };

    dispatch(addOrderApi(payload, onSuccessCallback, userToken));
  };

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
                            £{item?.originalPrice}
                          </p>
                          {/* <span className={styles.price2}>
                            £{item?.originalPrice}
                          </span> */}
                        </div>
                      </div>
                    </>
                  ))}

                  {/* <div className={styles.delivery}>
                    <Image preview={false} src={delivery} alt="delivery" />
                    <p className={styles.business}>
                      Estimated delivery by 5 to 7 business days
                    </p>
                  </div> */}

                  <div className={styles.code}>
                    <div className={styles.enter}>
                      <div className={styles.rowNew}>
                        <Input
                          placeholder="Enter coupon code"
                          className={styles.coding}
                          onChange={(e) => setCouponCode(e.target.value)}
                        />

                        <div
                          className={couponName ? styles.enter3 : styles.enter2}
                        >
                          <Button
                            className={styles.apply}
                            onClick={() => handleCouponCode()}
                            loading={loaderCoupon}
                            disabled={couponName}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>

                      <div className={styles.blank4}></div>
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
                      <div onClick={showModalCoupon} className={styles.rowNew}>
                        <p className={styles.explore}>
                          Don’t have any, Explore here...
                        </p>
                        <Image
                          preview={false}
                          src={arrow}
                          alt="arrow"
                          className={styles.arrow}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p>Total MRP</p>
                    <div className={styles.pro}>
                      <p className={styles.pro1}>
                        £{cartlist?.totalOriginalAmount}
                      </p>
                      {/* <span className={styles.pro2}>
                        £{cartlist?.totalOriginalAmount}
                      </span> */}
                    </div>
                  </div>
                  <div className={styles.coupon}>
                    <p className={styles.coupon1} style={{ color: "black" }}>
                      Shipping Charge
                    </p>
                    <p className={styles.coupon2} style={{ color: "black" }}>
                      £{cartlist?.ShippingCharge ? cartlist?.ShippingCharge : 0}
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
                            £
                            {applyCoupon?.[0]?.discountAmount
                              ? applyCoupon?.[0]?.discountAmount * quienty
                              : 0}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className={styles.coupon1}>Coupon Discount</p>
                          <p className={styles.coupon2}>
                            £
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

                  <div className={styles.blank3}></div>
                  <div style={{ margin: 0 }} className={styles.amount}>
                    <p className={styles.amount1}>Total Amount</p>
                    <p className={styles.amount2}>£ {TotalAmount()}</p>
                  </div>

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
                        Discount £{item?.discountAmount}
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
