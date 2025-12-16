/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Col, Image, Row } from "antd";
import { routes } from "../../Routes/Routes";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";

import { setLikeCount } from "../../Features/User/User";
import { addWishList, getWishListApi } from "../../Features/WishList/WishList";

import styles from "./index.module.scss";

function Like() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(true);
  const [productId, setProductId] = useState(null);

  const userToken = useSelector((state) => state.user?.token);
  const likeCounter = useSelector((state) => state.user?.likeCount);
  const givewishlist = useSelector((state) => state.wishList?.wishlist);

  useEffect(() => {
    dispatch(getWishListApi(userToken));
    window.scrollTo(0, 0);
    let qty = 0;
    givewishlist?.forEach((x) => {
      qty += 1;
    });
    dispatch(setLikeCount(qty));
  }, []);

  const handleAddCart = (id) => {
    setProductId(id);
    navigate(routes.addcartUrl, {
      state: {
        productId: id,
      },
    });
    window.location.reload();
  };

  const toggleLike = (value) => {
    const obj = {
      productId: value,
    };
    const onSuccessCallback = () => {
      dispatch(getWishListApi(userToken));
      if (isLiked === false) {
        setIsLiked(!isLiked);
        // dispatch(setLikeCount(likeCounter + 1));
      } else {
        if (likeCounter > 0) {
          // dispatch(setLikeCount(likeCounter - 1));
          dispatch(getWishListApi(userToken));
        }
      }
    };
    dispatch(addWishList(obj, onSuccessCallback, userToken));
  };

  const back = () => {
    navigate(routes.homepageUrl);
  };

  return (
    <div>
      {givewishlist?.length > 0 ? (
        <Row justify="center" className={styles.mainLine}>
          <Col xs={22} md={22} lg={22} xl={22} xxl={22} className={styles.wear}>
            <Row justify="start">
              {givewishlist?.map((item, index) => (
                <Col
                  xs={12}
                  md={12}
                  lg={8}
                  xl={6}
                  xxl={6}
                  className={styles.setMain}
                >
                  <div className={styles.slider} key={index}>
                    <div className={styles.hearticon}>
                      <HeartFilled
                        className={isLiked ? styles.pink : styles.normal}
                        onClick={() => toggleLike(item?._id)}
                      />
                    </div>
                    <Image
                      src={item?.Product_Image}
                      preview={false}
                      alt="Product_Image"
                      onClick={() => handleAddCart(item?._id)}
                    />
                    <p>{item?.Product_Name}</p>
                    <div className={styles.prices}>
                      <p>₹{item?.Product_Dis_Price || 0}</p>
                      <span className={styles.secPrice}>
                        ₹{item?.Product_Ori_Price || 0}
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
    </div>
  );
}

export default Like;
