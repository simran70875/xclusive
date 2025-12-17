/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";
import { useDispatch, useSelector } from "react-redux";
import { Button, Col, Image, Modal, Radio, Rate, Row } from "antd";

import {
  getSingleOrderApi,
  updateOrderApi,
} from "../../../Features/Order/Order";
import {
  addReviewApi,
  getSingleReviewApi,
} from "../../../Features/Setting/Setting";
import cash from "../../../Assets/PNG/cash.png";
import wallet from "../../../Assets/PNG/wallet.png";
import online from "../../../Assets/PNG/online.png";
import { getProfileApi } from "../../../Features/User/User";
import styles from "./index.module.scss";

function OrderView() {
  const dispatch = useDispatch();
  const { state } = useLocation();
  console.log("state ==> ", state);
  // console.log(state?.PaymentType);
  // console.log("state", state);
  const [status, setStatus] = useState();
  const [value, setValue] = useState(0);
  const [comment, setComment] = useState();
  const [isModalRate, setIsModalRate] = useState(false);
  const [isModalViewRate, setIsModalViewRate] = useState(false);
  const [orderView, setOrderView] = useState(false);
  const [orderCancel, setOrderCancel] = useState("");
  const [ordertype, setOrdertype] = useState("");
  const [orderCancel2, setOrderCancel2] = useState(null);
  const [inputValue, setInputValue] = useState(null);
  const [quienty, setQuienty] = useState(0);
  // console.log("quienty", quienty);

  const userToken = useSelector((state) => state.user?.token);
  const profileData = useSelector((state) => state.user?.profileData);
  // console.log("profileData", profileData);
  const reviewData = useSelector((state) => state.setting?.singleReviewData);
  // console.log("reviewData", reviewData);
  const orderData = useSelector((state) => state.order?.cancelOrderData);
  // console.log("orderData", orderData);
  const loader = useSelector((state) => state.setting?.settingLoading);

  const desc = ["Very disappointmenting", "Poor", "okay", "good", "Excellent"];

  useEffect(() => {
    dispatch(getSingleReviewApi(state?._id, userToken));
    dispatch(getSingleOrderApi(state?._id, userToken));
    dispatch(getProfileApi(userToken));
    let qty = 0;
    state?.cartData.forEach((x) => {
      qty += x.Quantity;
    });
    setQuienty(qty);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    switch (state?.OrderType) {
      case "1":
        setStatus("Pending");
        break;
      case "2":
        setStatus("Accepted");
        break;
      case "3":
        setStatus("Pick Up");
        break;
      case "4":
        setStatus("Rejected");
        break;
      case "5":
        setStatus("Delivered");
        break;
      case "6":
        setStatus("Cancelled");
        break;
      case "7":
        setStatus("Returned");
        break;
      default:
        setStatus("Unknown");
    }
  }, []);

  const handleOrderCancel = (value) => {
    // console.log("value", value);
    setOrderCancel2(value);
    let obj = {
      orderType: "6",
      reason: value,
    };
    // console.log("obj", obj);
    // if (value !== "") {
    // setOrderView(false);
    const onSuccessCallback = () => {
      setOrderView(false);
      dispatch(getSingleOrderApi(state?._id, userToken));
    };
    dispatch(updateOrderApi(obj, userToken, state?._id, onSuccessCallback));
    // }
  };

  const showModalRate = () => {
    setIsModalRate(true);
  };

  const handleOkRate = () => {
    let value1 = value.toString();
    let obj = {
      order: state?._id,
      comment: comment,
      text: desc[value - 1],
      rating: value1,
    };
    const onSuccessCallback = () => {
      setIsModalRate(false);
      dispatch(getSingleReviewApi(state?._id, userToken));
    };
    dispatch(addReviewApi(obj, onSuccessCallback, userToken));
  };

  const handleCancelRate = () => {
    setIsModalRate(false);
  };

  const showModalViewRate = () => {
    setIsModalViewRate(true);
  };

  const handleCancelViewRate = () => {
    setIsModalViewRate(false);
  };

  const showModalOrder = () => {
    setOrderView(true);
  };

  const handleCancelOrder = () => {
    setOrderView(false);
  };

  const handleCancelOrderRadio = (value) => {
    // console.log("val", value);
    switch (value) {
      case "Product not required any more":
        setOrdertype("Product not required any more");
        break;

      case "Purchased product from somewhere else":
        setOrdertype("Purchased product from somewhere else");
        break;

      case "Incorrect size / color / type ordered":
        setOrdertype("Incorrect size / color / type ordered");
        break;

      case "Purchased Product from somewhere else":
        setOrdertype("Purchased Product from somewhere else");
        break;

      case "Incorrect size / color / type Ordered":
        setOrdertype("Incorrect size / color / type Ordered");
        break;

      case "Purchased-product from somewhere else":
        setOrdertype("Purchased-product from somewhere else");
        break;
      case "Incorrect Size / Color / Type ordered":
        setOrdertype("Incorrect Size / Color / Type ordered");
        break;

      case "Other":
        setOrdertype("Other");
        break;

      default:
        break;
    }
  };

  return (
    <div>
      <Row justify="center" className={styles.mainLine}>
        <Col xs={22} md={22} lg={22} xl={18} xxl={18} className={styles.main}>
          <Row justify="center">
            <Col xs={22} md={22} lg={22} xl={22} xxl={22}>
              <div className={styles.mainfix}>
                <div className={styles.sethead}>
                  <p className={styles.order}>ORDER ID : {state?.orderId}</p>
                  {orderCancel2 || state?.OrderType === "6" ? (
                    <Button className={styles.Canceled}>Cancelled</Button>
                  ) : (
                    <Button
                      className={
                        status === "Pending"
                          ? styles.pend
                          : status === "Accepted"
                          ? styles.Accepted
                          : status === "Pick Up"
                          ? styles.pickup
                          : status === "Rejected"
                          ? styles.Rejected
                          : status === "Delivered"
                          ? styles.Delivered
                          : status === "Cancelled"
                          ? styles.Canceled
                          : status === "Returned"
                          ? styles.Returned
                          : styles.black
                      }
                    >
                      {status}
                    </Button>
                  )}
                </div>
                <Row className={styles.history}>
                  <Col
                    xs={24}
                    md={24}
                    lg={24}
                    xl={24}
                    xxl={24}
                    className={styles.shopping}
                  >
                    <div className={styles.product}>
                      <p>Product</p>
                    </div>
                    <div className={styles.blank}></div>
                    {state?.cartData?.map((item2, index) => (
                      <>
                        {/* {// console.log("dcdcdc",item2)} */}
                        <div className={styles.showItem} key={index}>
                          <div className={styles.foil}>
                            <Image preview={false}
                              
                              src={item2?.variationImage}
                              // src={wear}
                              alt="wear1"
                              className={styles.wear}
                            />
                            <div>
                              <p className={styles.boota} key={index}>
                                {item2?.product?.Product_Name}
                              </p>
                              <p className={styles.size}>
                                Size - {item2?.SizeName}
                              </p>
                              {/* <p className={styles.size}>color - pink</p> */}
                            </div>
                            <div className={styles.set}>
                              <Image preview={false}
                                
                                // src={wear}
                                src={item2?.variationImage}
                                alt="wear1"
                                className={styles.wear}
                              />
                              <div>
                                <p className={styles.boota} key={index}>
                                  {item2?.product?.Product_Name}
                                </p>
                                <p className={styles.size}>
                                  Size - {item2?.SizeName}
                                </p>
                                {/* <p className={styles.size}>color - pink</p> */}
                              </div>
                            </div>
                            <div className={styles.seting}>
                              <div className={styles.prices}>
                                <p className={styles.prices1}>
                                  ₹{item2?.discountPrice}
                                </p>
                                <p className={styles.prices2}>
                                  ₹{item2?.originalPrice}
                                </p>
                              </div>
                              <div className={styles.incree}>
                                <p className={styles.showdata}>
                                  Q-{item2?.Quantity}
                                </p>
                              </div>
                              <div className={styles.total}>
                                <p>₹{item2?.discountPrice * item2?.Quantity}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={styles.blank2}></div>
                      </>
                    ))}
                  </Col>
                </Row>
                <Row justify="space-between">
                  <Col
                    xs={24}
                    md={12}
                    lg={11}
                    xl={11}
                    xxl={11}
                    className={styles.paydetail}
                  >
                    <p className={styles.paydetailtext}>Payment Details</p>
                    <div className={styles.total}>
                    <p className={styles.pricetotal}>Total Price</p>

                    <div className={styles.prices}>
                    <p className={styles.money}>
                    ₹{state?.DiscountPrice || 0}
                    </p>

                    <span className={styles.secPrice}>
                    ₹{state?.OriginalPrice || 0}
                    </span>
                    </div>
                    </div>

                    <div className={styles.total}>
                      <p className={styles.pricetotal}>Shipping Charges</p>
                      <p className={styles.money}>₹{state?.Shipping_Charge}</p>
                    </div>

                    {state?.cod_advance_amt > 0 && (
                      <div className={styles.total}>
                        <p
                          style={{ color: "green" }}
                          className={styles.pricetotal}
                        >
                          COD Advance Amount
                        </p>
                        <p style={{ color: "green" }} className={styles.money}>
                          ₹{state?.cod_advance_amt}
                        </p>
                      </div>
                    )}

                    {state?.cod_advance_amt > 0 && (
                      <div className={styles.total}>
                        <p
                          style={{ color: state?.OrderType === "5" ? "green" : "red"}}
                          className={styles.pricetotal}
                        >
                          Pending Amount
                        </p>
                        <p style={{ color: state?.OrderType === "5" ? "green" : "red" }} className={styles.money}>
                          ₹{state?.FinalPrice - state?.cod_advance_amt}
                        </p>
                      </div>
                    )}

                    {state?.walletAmount > 0 && (
                      <div className={styles.total}>
                        <p style={{color:'green'}} className={styles.pricetotal}>Used From Wallet</p>
                        <p  style={{color:'green'}} className={styles.money}>₹{state?.walletAmount}</p>
                      </div>
                    )}

                    {(state?.ActualPayment > 0 || state?.FinalAdavnceCodPrice)   && (
                      <div className={styles.total}>
                        <p className={styles.pricetotal}>Online Paid</p>
                        <p className={styles.money}>₹{state?.ActualPayment || state?.FinalAdavnceCodPrice}</p>
                      </div>
                    )}

                    
                    {state?.CouponPrice > 0 && (
                      <div className={styles.total}>
                        <p style={{color:'green'}} className={styles.pricetotal}>Coupon Discount  <span style={{ color: "black" }}>
                            ({orderData?.[0]?.Coupon})
                          </span></p>
                        <p  style={{color:'green'}} className={styles.money}>₹{state?.CouponPrice}</p>
                      </div>
                    )}

                    {state?.cod_status && (
                      <div className={styles.total}>
                        <p className={styles.pricetotal}>COD Status</p>
                        <p className={styles.money}>{state?.cod_status}</p>
                      </div>
                    )}

               

                    <div className={styles.total}>
                      <p className={styles.pricetotal}>Payment Status</p>
                      <p className={styles.money}>{state?.PaymentStatus}</p>
                    </div>

                    <div className={styles.total1}>
                      <p className={styles.pricetotal1}>Total Amount</p>
                      <p className={styles.money1}>
                        ₹{state?.FinalPrice + state?.CouponPrice}
                      </p>
                    </div>
                  </Col>
                  <Col xs={24} md={11} lg={11} xl={11} xxl={11}>
                    <div className={styles.paydetail1}>
                      <p className={styles.paydetailtext1}>Contact Details</p>
                      <div className={styles.total1}>
                        <p className={styles.pricetotal1}>
                          {state?.Address?.Name} |{" "}
                          {state?.Address?.Phone_Number}
                        </p>
                      </div>
                      <div className={styles.blank31}></div>
                      <div className={styles.total1}>
                        <p
                          className={styles.pricetotal1}
                          style={{
                            textAlign: "start",
                          }}
                        >
                          {state?.Address?.Full_Address}
                        </p>
                      </div>
                    </div>
                    <div className={styles.paydetail2}>
                      <p className={styles.paydetailtext2}>Payment Method :</p>

                      <div className={styles.choose}>
                        {state?.PaymentType === "0" ? (
                          <Image preview={false}
                            
                            src={wallet}
                            alt="wallet"
                            className={styles.wallet}
                          />
                        ) : (
                          <Image preview={false}
                            
                            src={cash}
                            alt="cash"
                            className={styles.wallet}
                          />
                        )}

                        <p className={styles.thousand} value={2}>
                          {state?.PaymentType === "0"
                            ? "Wallet"
                            : state?.PaymentType === "1"
                            ? "Online Payment"
                            : "Cash on Delivery"}
                        </p>
                      </div>
                    </div>
                  </Col>
                </Row>
                <div className={styles.setadd}>
                  {status === "Delivered" ? (
                    <>
                      {reviewData?.length > 0 ? (
                        <Button
                          className={styles.addrate}
                          onClick={() => showModalViewRate()}
                          // style={{
                          //   background: "#32140a",
                          //   color: "#ffff",
                          //   width: "30%",
                          //   height: "40px",
                          //   marginBottom: "50px",
                          // }}
                        >
                          View Rate
                        </Button>
                      ) : (
                        <Button
                          className={styles.addrate}
                          onClick={() => showModalRate()}
                          // style={{
                          //   background: "#32140a",
                          //   color: "#ffff",
                          //   width: "30%",
                          //   height: "40px",
                          //   marginBottom: "50px",
                          // }}
                        >
                          Add Rate
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      {orderCancel2 || state?.OrderType === "6" ? (
                        <>
                          {orderData?.map((item, index) => (
                            <>
                              <div
                                key={index}
                                className={styles.paydetail3}
                                style={{
                                  marginTop: "-60px",
                                  width: "100%",
                                }}
                              >
                                <p className={styles.paydetailtext2}>
                                  Reason for Cancelled order :{" "}
                                  <span
                                    style={{
                                      color: "red",
                                    }}
                                  >
                                    {item?.reason ? item?.reason : orderCancel2}
                                  </span>
                                </p>
                              </div>
                            </>
                          ))}
                        </>
                      ) : (
                        <>
                          {state?.OrderType === "6" ? (
                            ""
                          ) : (
                            ""
                            // <Button
                            //   className={styles.addrate}
                            //   onClick={() => showModalOrder()}
                            //   // style={{
                            //   //   background: "#32140a",
                            //   //   color: "#ffff",
                            //   //   width: "30%",
                            //   //   height: "40px",
                            //   //   marginBottom: "50px",
                            //   // }}
                            // >
                            //   Cancel Order
                            // </Button>
                          )}
                        </>
                      )}
                    </>
                  )}
                  <Modal
                    open={orderView}
                    onCancel={handleCancelOrder}
                    footer={null}
                  >
                    <div className={styles.orderset}>
                      <p className={styles.reason}>Reason for cancellation</p>
                      <div className={styles.orderblank}></div>
                      <div className={styles.ordersetting}>
                        <div>
                          <p className={styles.product}>
                            Product not required any more
                          </p>
                          <Radio
                            className={styles.orderRadio}
                            onChange={() => {
                              setOrderCancel("Product not required any more");
                              setInputValue("Product not required any more");
                              handleCancelOrderRadio(
                                "Product not required any more"
                              );
                            }}
                            value={"Product not required any more"}
                            checked={
                              ordertype === "Product not required any more"
                            }
                          ></Radio>
                        </div>
                        <div>
                          <p className={styles.product}>
                            Purchased product from somewhere else
                          </p>
                          <Radio
                            className={styles.orderRadio}
                            onChange={() => {
                              setOrderCancel(
                                "Purchased product from somewhere else"
                              );
                              setInputValue(
                                "Purchased product from somewhere else"
                              );
                              handleCancelOrderRadio(
                                "Purchased product from somewhere else"
                              );
                            }}
                            value={"Purchased product from somewhere else"}
                            checked={
                              ordertype ===
                              "Purchased product from somewhere else"
                            }
                          ></Radio>
                        </div>
                        <div>
                          <p className={styles.product}>
                            Incorrect size / color / type ordered
                          </p>
                          <Radio
                            className={styles.orderRadio}
                            onChange={() => {
                              setOrderCancel(
                                "Incorrect size / color / type ordered"
                              );
                              setInputValue(
                                "Incorrect size / color / type ordered"
                              );
                              handleCancelOrderRadio(
                                "Incorrect size / color / type ordered"
                              );
                            }}
                            value={"Incorrect size / color / type ordered"}
                            checked={
                              ordertype ===
                              "Incorrect size / color / type ordered"
                            }
                          ></Radio>
                        </div>
                        <div>
                          <p className={styles.product}>
                            Purchased product from somewhere else
                          </p>
                          <Radio
                            className={styles.orderRadio}
                            onChange={() => {
                              setOrderCancel(
                                "Purchased Product from somewhere else"
                              );
                              setInputValue(
                                "Purchased Product from somewhere else"
                              );
                              handleCancelOrderRadio(
                                "Purchased Product from somewhere else"
                              );
                            }}
                            value={"Purchased Product from somewhere else"}
                            checked={
                              ordertype ===
                              "Purchased Product from somewhere else"
                            }
                          ></Radio>
                        </div>

                        <div>
                          <p className={styles.product}>
                            Incorrect size / color / type ordered
                          </p>
                          <Radio
                            className={styles.orderRadio}
                            onChange={() => {
                              setOrderCancel(
                                "Incorrect size / color / type Ordered"
                              );
                              setInputValue(
                                "Incorrect size / color / type Ordered"
                              );
                              handleCancelOrderRadio(
                                "Incorrect size / color / type Ordered"
                              );
                            }}
                            value={"Incorrect size / color / type Ordered"}
                            checked={
                              ordertype ===
                              "Incorrect size / color / type Ordered"
                            }
                          ></Radio>
                        </div>
                        <div>
                          <p className={styles.product}>
                            Purchased product from somewhere else
                          </p>
                          <Radio
                            className={styles.orderRadio}
                            onChange={() => {
                              setOrderCancel(
                                "Purchased-product from somewhere else"
                              );
                              setInputValue(
                                "Purchased-product from somewhere else"
                              );
                              handleCancelOrderRadio(
                                "Purchased-product from somewhere else"
                              );
                            }}
                            value={"Purchased-product from somewhere else"}
                            checked={
                              ordertype ===
                              "Purchased-product from somewhere else"
                            }
                          ></Radio>
                        </div>

                        <div>
                          <p className={styles.product}>
                            Incorrect size / color / type ordered
                          </p>
                          <Radio
                            className={styles.orderRadio}
                            onChange={() => {
                              setOrderCancel(
                                "Incorrect Size / Color / Type ordered"
                              );
                              setInputValue(
                                "Incorrect Size / Color / Type ordered"
                              );
                              handleCancelOrderRadio(
                                "Incorrect Size / Color / Type ordered"
                              );
                            }}
                            value={"Incorrect Size / Color / Type ordered"}
                            checked={
                              ordertype ===
                              "Incorrect Size / Color / Type ordered"
                            }
                          ></Radio>
                        </div>
                        <div>
                          <p className={styles.product}>Other</p>
                          <Radio
                            className={styles.orderRadio}
                            onChange={() => {
                              setInputValue("Other");
                              handleCancelOrderRadio("Other");
                              setOrderCancel("");
                            }}
                            value={"Other"}
                            checked={ordertype === "Other"}
                          ></Radio>
                        </div>
                        {inputValue === "Other" ? (
                          <div className={styles.setinput}>
                            <TextArea
                              style={{ color: "black" }}
                              onChange={(e) => setOrderCancel(e.target.value)}
                              rules={[{ required: true, message: "" }]}
                            />
                          </div>
                        ) : (
                          ""
                        )}
                        <Button
                          className={styles.savebtnOrder}
                          onClick={() => handleOrderCancel(orderCancel)}
                        >
                          SAVE
                        </Button>
                      </div>
                    </div>
                  </Modal>
                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
      <Modal
        open={isModalViewRate}
        onCancel={handleCancelViewRate}
        footer={null}
      >
        <Row justify="center">
          <Col xl={23} xxl={23} className={styles.setrate}>
            {reviewData?.map((item, index) => (
              <>
                <p className={styles.settext} key={index}>
                  View Rating
                </p>
                <div className={styles.blank}></div>
                <div className={styles.setrateing}>
                  <Rate
                    className={styles.rates}
                    disabled
                    defaultValue={item?.rating}
                  />
                  <p className={styles.settextrate}>{item?.text}</p>
                </div>
                {item?.comment === "" ||
                item?.comment === null ||
                item?.comment == [] ||
                item?.comment?.length < 0 ? (
                  ""
                ) : (
                  <div className={styles.setinput}>
                    <TextArea
                      defaultValue={item?.comment}
                      disabled
                      style={{ color: "black" }}
                    />
                  </div>
                )}
              </>
            ))}
          </Col>
        </Row>
      </Modal>
      <Modal open={isModalRate} onCancel={handleCancelRate} footer={null}>
        <Row justify="center">
          <Col xl={23} xxl={23} className={styles.setrate}>
            <p className={styles.settext}>Add Rating</p>
            <div className={styles.blank}></div>
            <div className={styles.setrateing}>
              <Rate
                tooltips={desc}
                onChange={setValue}
                value={value}
                className={styles.rates}
              />
              {value ? (
                <p className={styles.settextrate}>{desc[value - 1]}</p>
              ) : (
                <p className={styles.settextrate}>Add Rating</p>
              )}
            </div>
            <p className={styles.provide}>
              By providing excellent reviews, you will be granted a reward of 50
              coins.
            </p>
            <div className={styles.setinput}>
              <p>Leave Comment</p>
              <TextArea
                placeholder="Comment here.."
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <Button
              className={styles.savebtn}
              onClick={() => handleOkRate()}
              loading={loader}
            >
              SAVE
            </Button>
          </Col>
        </Row>
      </Modal>
    </div>
  );
}

export default OrderView;
