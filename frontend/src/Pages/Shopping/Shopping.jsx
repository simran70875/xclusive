/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import React, { useState } from "react";
import { Button, Col, Image, Row } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  deleteCartListApi,
  deleteaLLCartListApi,
  editCartApi,
  geCartListApi,
} from "../../Features/AddCart/AddCart";
import { routes } from "../../Routes/Routes";
import close from "../../Assets/PNG/close.png";
import { setCartCount } from "../../Features/User/User";

import styles from "./index.module.scss";

function Shopping() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [data, setData] = useState();
  const [stoke, setStoke] = useState();
  const [quentity, setQuentity] = useState();
  const [stockCont, setStockCount] = useState();
  const userToken = useSelector((state) => state.user?.token);
  const cartCounter = useSelector((state) => state.user?.cartCount);
  const cartlist = useSelector((state) => state.addCart?.cartListData);
  const loader = useSelector((state) => state.addCart?.isAddCartLoad);

  const isContinueButtonDisabled = cartlist?.cartItems?.some(
    (item) =>
      item?.Quantity > item?.Stock || item?.Quantity <= 0 || item?.outOfStock
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    dispatch(geCartListApi(userToken));
    setStockCount(stockCont);
    setData(quentity);
    // let qty = 0;
    // cartlist?.cartItems.forEach((x) => {
    //   qty += 1;
    // });
    // setTotalProduct(qty);
    // dispatch(setCartCount(qty ? qty : cartCounter));
  }, []);

  const Incree = (item) => {
    // console.log("item", item?.Stock);
    setQuentity(item?.Quantity);
    setStoke(item?.Stock);
    const updatedQuantity = item?.Quantity + 1;
    const obj = {
      Quantity: updatedQuantity,
    };
    const onSuccessCallback = () => {
      dispatch(geCartListApi(userToken));
      setData(updatedQuantity);
    };
    dispatch(editCartApi(obj, userToken, item?._id, onSuccessCallback));
  };

  const Decree = (item) => {
    // console.log(item?.Stock);
    setStoke(item?.Stock);
    const updatedQuantity = item?.Quantity - 1;
    const obj = {
      Quantity: updatedQuantity,
    };
    const onSuccessCallback = () => {
      dispatch(geCartListApi(userToken));
      setData(updatedQuantity);
      if (updatedQuantity === 0) {
        dispatch(deleteCartListApi(item?._id, userToken));
        // dispatch(setCartCount(cartCounter - 1));
      }
    };
    setData(data - 1);
    dispatch(editCartApi(obj, userToken, item?._id, onSuccessCallback));
  };

  const removeCartList = (item) => {
    // window.location.reload();
    if (cartCounter > 0) {
      dispatch(setCartCount(cartCounter - 1));
    }
    dispatch(deleteCartListApi(item?._id, userToken));
  };

  const handleSubmit = () => {
    navigate(routes.summeryUrl);
    window.location.reload();
  };

  const handleContinue = () => {
    navigate(routes.homepageUrl);
    window.location.reload();
  };

  const clearCart = () => {
    dispatch(deleteaLLCartListApi(userToken));
    dispatch(setCartCount(0));
  };

  const back = () => {
    navigate(routes.homepageUrl);
    window.location.reload();
  };

  return (
    <div>
      {cartlist?.cartItems?.length > 0 ? (
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
                <p className={styles.cart}>Shopping Cart</p>
                <div className={styles.product}>
                  <p>Product</p>
                  <div>
                    <p>Price</p>
                    <p>Quantity</p>
                    <p>Total</p>
                    <p className={styles.mobileSize}>
                      Price & Quantity & Total
                    </p>
                  </div>
                </div>
                <div className={styles.blank}></div>
                {cartlist?.cartItems?.map((item, index) => {
                  let stock1 = item?.Stock;
                  return (
                    <>
                      <div className={styles.showItem} key={index}>
                        <Image
                          preview={false}
                          src={close}
                          alt="close"
                          className={styles.close}
                          onClick={() => removeCartList(item)}
                        />
                        <div className={styles.foil}>
                          <div>
                            <Image
                              preview={false}
                              src={item?.Variation?.variation_Image}
                              alt="wear1"
                              className={styles.wear}
                            />
                            <div>
                              <p className={styles.boota}>
                                {item?.Product?.product_Name}
                              </p>
                              <p className={styles.size}>
                                Size - {item?.SizeName}
                              </p>
                              {item?.Quantity > item?.Stock ? (
                                <p
                                  className={styles.size}
                                  style={{
                                    background: "red",
                                    color: "white",
                                    width: "55%",
                                    padding: "2px 10px",
                                  }}
                                >
                                  out of stock
                                </p>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                          <div className={styles.seting}>
                            <div className={styles.prices}>
                              <p className={styles.prices1}>
                                ₹{item?.discountPrice_product}
                              </p>
                              <p className={styles.prices2}>
                                ₹{item?.originalPrice_product}
                              </p>
                            </div>
                            <div className={styles.incree}>
                              <Button
                                onClick={() => Decree(item)}
                                className={styles.decree}
                              >
                                -
                              </Button>
                              <p className={styles.showdata}>
                                {item?.Quantity}
                              </p>
                              <Button
                                onClick={() => Incree(item)}
                                className={styles.incre2}
                                // disabled={data >= stock1}
                                disabled={item?.Quantity >= item?.Stock}
                              >
                                +
                              </Button>
                            </div>
                            <div className={styles.total}>
                              <p>₹{item?.discountPrice}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.blank2}></div>
                    </>
                  );
                })}
                <div className={styles.continue}>
                  <p className={styles.shop} onClick={handleContinue}>
                    Continue Shopping
                  </p>
                  <p className={styles.clear} onClick={() => clearCart()}>
                    Clear Cart
                  </p>
                </div>
              </Col>
              <Col
                xs={24}
                md={24}
                lg={24}
                xl={8}
                xxl={8}
                className={styles.ordersider}
              >
                <div>
                  <div className={styles.order}>
                    <p>Your Order Summary</p>
                    <div>
                      <p>Total MRP</p>
                      <div className={styles.prices}>
                        <p className={styles.price1}>
                          ₹{cartlist?.totalDiscount}
                        </p>
                        <span className={styles.price2}>
                          ₹{cartlist?.totalOriginalAmount}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p>Shipping Charge</p>
                      <div className={styles.prices}>
                        <p className={styles.price1}>
                          ₹{cartlist?.ShippingCharge}
                        </p>
                      </div>
                    </div>
                    <div className={styles.blank3}></div>
                    <div className={styles.amount}>
                      <p className={styles.amount1}>Total Amount</p>
                      <p className={styles.amount2}>₹{cartlist?.totalAmount}</p>
                    </div>
                    <Button
                      className={styles.proced}
                      onClick={handleSubmit}
                      loading={loader}
                      // disabled={item?.Quantity > item?.Stock}
                      disabled={isContinueButtonDisabled}
                    >
                      CONTINUE
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      ) : (
        <>
          <p
            style={{
              fontSize: "20px",
            }}
          >
            NO DATA FOUND!
          </p>
          <Button
            style={{
              background: "black",
              color: "white",
              marginBottom: "50px",
            }}
            onClick={back}
          >
            Back to Home
          </Button>
        </>
      )}
    </div>
  );
}

export default Shopping;
