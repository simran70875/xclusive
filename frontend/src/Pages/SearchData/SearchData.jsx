/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Col, Image, Row, Spin } from "antd";
import { routes } from "../../Routes/Routes";
import { useNavigate } from "react-router-dom";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setLikeCount } from "../../Features/User/User";
import { getFilterListApi } from "../../Features/Product/Product";
import { addWishList, getWishListApi } from "../../Features/WishList/WishList";

import styles from "./index.module.scss";

function SearchData() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [productId, setProductId] = useState(null);

  const userToken = useSelector((state) => state.user?.token);
  const likeCounter = useSelector((state) => state.user?.likeCount);
  const filterList = useSelector((state) => state.product?.filterList);
  const givewishlist = useSelector((state) => state.wishList?.wishlist);
  const loader = useSelector((state) => state.product?.productLoading);

  useEffect(() => {
    dispatch(getWishListApi(userToken));
    // dispatch(getFilterListApi());
    window.scrollTo(0, 0);
  }, []);

  const handleAddCart = (id) => {
    setProductId(id);
    navigate(routes.addcartUrl, {
      state: {
        productId: id,
      },
    });
    
  };

  const toggleLike = (value) => {
    const obj = {
      productId: value,
    };
    const onSuccessCallback = () => {
      // dispatch(getWishListApi(userToken));
      if (isLiked === false) {
        dispatch(getWishListApi(userToken));
        setIsLiked(!isLiked);
        dispatch(setLikeCount(likeCounter + 1));
      } else {
        if (likeCounter > 0) {
          dispatch(setLikeCount(likeCounter - 1));
          dispatch(getWishListApi(userToken));
        }
      }
    };
    dispatch(addWishList(obj, onSuccessCallback, userToken));
  };

  const getProductIsLikedOrNot = (id) =>
    Boolean(givewishlist?.find((e) => e._id == id));

  const back = () => {
    navigate(routes.homepageUrl);
  };

  return (
    <div>
      {loader ? (
        <Spin
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "50px",
          }}
        />
      ) : (
        <>
          {filterList?.length > 0 ? (
            <Row justify="center">
              <Col xl={22} xxl={22} className={styles.wear}>
                <Row justify="start">
                  {filterList?.map((item, index) => (
                    <Col xl={6} xxl={6} className={styles.setMain}>
                      <div className={styles.slider} key={index}>
                        <div className={styles.hearticon}>
                          {getProductIsLikedOrNot(item?._id) ? (
                            <HeartFilled
                              className={styles.pink}
                              onClick={() => {
                                toggleLike(item?._id);
                              }}
                            />
                          ) : (
                            <HeartOutlined
                              className={styles.normal}
                              onClick={() => {
                                toggleLike(item?._id);
                              }}
                            />
                          )}
                        </div>
                        <Image preview={false}
                          src={item?.Product_Image}
                          
                          alt="Product_Image"
                          onClick={() => handleAddCart(item?._id)}
                        />
                        <p>{item?.Product_Name}</p>
                        <div className={styles.prices}>
                          <p>£{item?.Product_Dis_Price || 0}</p>
                          <span className={styles.secPrice}>
                            £{item?.Product_Ori_Price || 0}
                          </span>
                        </div>
                      </div>
                    </Col>
                  ))}
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
        </>
      )}
    </div>
  );
}

export default SearchData;
