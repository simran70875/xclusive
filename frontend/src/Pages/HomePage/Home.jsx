/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import Slider from "react-slick";
import { memo, useState } from "react";
import ReactPlayer from "react-player";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Col, Image, Row } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";

import {
  getBannerApi,
  getBannerProductApi,
} from "../../Features/Banner/Banner";

import {
  getProductFeatureListApi,
  getProductFeatureListApi1,
  getProductFeatureListApi2,
  getProductFeatureListApi3,
} from "../../Features/Product/Product";
import logo from "../../Assets/PNG/logo.png";
import logo2 from "../../Assets/PNG/logo.png";
import reseller from "../../Assets/PNG/reseller.png";
import thankyou from "../../Assets/PNG/thankyou.png";
import simple from "../../Assets/PNG/simple.png";
import appstore from "../../Assets/PNG/appstore.png";
import playstore from "../../Assets/PNG/playstore.png";
import CustomerReview from "./CustomerReview/CustomerReview";
import { getSettingApi } from "../../Features/Setting/Setting";
import { getProfileApi } from "../../Features/User/User";
import { getCategoryFeatureApi } from "../../Features/Category/Category";
import { addWishList, getWishListApi } from "../../Features/WishList/WishList";

import styles from "./index.module.scss";
import PopupModal from "./PopupModal";

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  const categoryFeature = useSelector(
    (state) => state.category?.categoryFeatureData
  );
  const productFeatureListing = useSelector(
    (state) => state.product?.productList
  );
  const productFeatureListing1 = useSelector(
    (state) => state.product?.productList1
  );
  const productFeatureListing2 = useSelector(
    (state) => state.product?.productList2
  );
  const productFeatureListing3 = useSelector(
    (state) => state.product?.productList3
  );
  const userid = useSelector((state) => state.user?.userId);
  const userToken = useSelector((state) => state.user?.token);
  const banner = useSelector((state) => state.banner?.bannerData);
  const likeCounter = useSelector((state) => state.user?.likeCount);
  const bannerPrpduct = useSelector((state) => state.banner?.bannerProductData);
  const givewishlist = useSelector((state) => state.wishList?.wishlist);
  const catagoryItem = useSelector((state) => state.category?.categoryData);
  const settingVideo = useSelector((state) => state.setting?.settingData);
  const profileData = useSelector((state) => state.user?.profileData);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    dispatch(getCategoryFeatureApi());
    dispatch(getBannerApi());
    dispatch(getBannerProductApi());
    dispatch(getWishListApi(userToken));
    dispatch(getProfileApi(userToken));
    dispatch(getSettingApi());

    dispatch(getProductFeatureListApi(userid !== null ? userid : 0));
    dispatch(getProductFeatureListApi1(userid !== null ? userid : 0));
    dispatch(getProductFeatureListApi2(userid !== null ? userid : 0));
    dispatch(getProductFeatureListApi3(userid !== null ? userid : 0));
  }, []);

  const handleAddCart = (id, name) => {
    navigate(`/product-detail/${name}`, {
      state: {
        productId: id,
      },
    });
    window.location.reload();
  };

  const Catagory = (item) => {
    navigate(`/product/${item?.category_Name || item?.categoryName}`, {
      state: {
        item: item?.category_Name || item?.categoryName,
        id: item?.category_id || item?.categoryId,
      },
    });
    window.location.reload();
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

  const getProductIsLikedOrNot = (id) =>
    Boolean(givewishlist?.find((e) => e._id == id));

  let settings = {
    dots: true,
    infinite: true,
    speed: 2500,
    slidesToShow: 7,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 100,
    responsive: [
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3.1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2.5,
        },
      },
      {
        breakpoint: 426,
        settings: {
          slidesToShow: 1.3,
        },
      },
      {
        breakpoint: 376,
        settings: {
          slidesToShow: 1.2,
        },
      },
      {
        breakpoint: 321,
        settings: {
          slidesToShow: 1.1,
        },
      },
    ],
  };

  let settings2 = {
    dots: true,
    infinite: true,
    speed: 2500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 100,
    responsive: [
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 426,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 376,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 321,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  let settings3 = {
    dots: true,
    infinite: true,
    speed: 2500,
    slidesToShow: 4.1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 100,
    responsive: [
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: 4.1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2.1,
        },
      },
      {
        breakpoint: 426,
        settings: {
          slidesToShow: 1.5,
        },
      },
      {
        breakpoint: 376,
        settings: {
          slidesToShow: 1.3,
        },
      },
      {
        breakpoint: 321,
        settings: {
          slidesToShow: 1.2,
        },
      },
    ],
  };

  return (
    <div>
      <Row justify="center" className={styles.mainLine}>
        <Col xs={24} md={24} lg={24} xl={24} xxl={24} className={styles.banner}>
          <Slider {...settings2} className={styles.bannercourasel}>
            {banner?.map((item, index) => (
              <>
                <Image
                  key={index}
                  src={item?.banner_Image}
                  alt="banner_Image"
                  preview={false}
                  onClick={() => Catagory(item)}
                />
              </>
            ))}
          </Slider>
        </Col>

        {/* {catagoryItem?.length <= 4 ? ( */}
        <Col xs={22} lg={22} xl={22} xxl={22} className={styles.wear1}>
          {catagoryItem?.map((data, index) => (
            <div className={styles.slider} key={index}>
              <Image
                src={data.category_Image}
                preview={false}
                alt="ellips"
                onClick={() => Catagory(data)}
              />
              <p>{data.category_Name}</p>
            </div>
          ))}
        </Col>
        {/* // ) : (
        //   <Col xs={22} lg={22} xl={22} xxl={22} className={styles.couraselMain}>
        //     <Slider {...settings} className={styles.handlecourasel}>
        //       {catagoryItem?.map((data, index) => (
        //         <div className={styles.slider} key={index}>
        //           <Image
        //             src={data.category_Image}
        //             preview={false}
        //             alt="ellips"
        //             onClick={() => Catagory(data)}
        //           />
        //           <p>{data.category_Name}</p>
        //         </div>
        //       ))}
        //     </Slider>
        //   </Col>
        // )} */}

        {productFeatureListing?.length <= 4 ? (
          <Col xs={22} md={22} lg={22} xl={22} xxl={22} className={styles.wear}>
            <h2>READY TO WEAR</h2>
            <Row justify="start">
              {productFeatureListing?.map((item, index) => (
                <Col xl={6} xxl={6} className={styles.setMain}>
                  <div className={styles.slider} key={index}>
                    {userToken ? (
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
                    ) : (
                      ""
                    )}
                    <Image
                      src={item?.Product_Image}
                      preview={false}
                      alt="Product_Image"
                      onClick={() =>
                        handleAddCart(item?._id, item?.Product_Name)
                      }
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
        ) : (
          <Col
            xs={22}
            md={22}
            lg={22}
            xl={22}
            xxl={22}
            className={styles.wearSet}
          >
            <h2>READY TO WEAR</h2>
            <Slider {...settings3} className={styles.smain}>
              {productFeatureListing?.map((item, index) => (
                <Col lg={22} xl={22} xxl={22}>
                  <Col xl={6} xxl={6} className={styles.setMain}>
                    <div className={styles.slider} key={index}>
                      {userToken ? (
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
                      ) : (
                        ""
                      )}
                      <Image
                        src={item?.Product_Image}
                        preview={false}
                        alt="Product_Image"
                        onClick={() =>
                          handleAddCart(item?._id, item?.Product_Name)
                        }
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
                </Col>
              ))}
            </Slider>
          </Col>
        )}
        {productFeatureListing1?.length <= 4 ? (
          <Col xs={22} md={22} lg={22} xl={22} xxl={22} className={styles.wear}>
            <h2>TRENDY COLLACTION</h2>
            <Row justify="start">
              {productFeatureListing1?.map((item, index) => (
                <Col lg={24} xl={6} xxl={6} className={styles.setMain}>
                  <div className={styles.slider} key={index}>
                    {userToken ? (
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
                    ) : (
                      ""
                    )}
                    <Image
                      src={item?.Product_Image}
                      preview={false}
                      alt="Product_Image"
                      onClick={() =>
                        handleAddCart(item?._id, item?.Product_Name)
                      }
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
        ) : (
          <Col
            xs={22}
            md={22}
            lg={22}
            xl={22}
            xxl={22}
            className={styles.wearSet}
          >
            <h2>TRENDY COLLECTIONS</h2>
            <Slider {...settings3} className={styles.smain}>
              {productFeatureListing1?.map((data, index) => (
                <Col lg={24} xl={6} xxl={6}>
                  <div className={styles.slider} key={index}>
                    {userToken ? (
                      <div className={styles.hearticon}>
                        {getProductIsLikedOrNot(data?._id) ? (
                          <HeartFilled
                            className={styles.pink}
                            onClick={() => {
                              toggleLike(data?._id);
                            }}
                          />
                        ) : (
                          <HeartOutlined
                            className={styles.normal}
                            onClick={() => {
                              toggleLike(data?._id);
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      ""
                    )}
                    <Image
                      src={data?.Product_Image || logo2}
                      preview={false}
                      alt="Product_Image"
                      onClick={() =>
                        handleAddCart(data?._id, data?.Product_Name)
                      }
                    />
                    <p>{data?.Product_Name}</p>
                    <div className={styles.prices}>
                      <p>₹{data?.Product_Dis_Price || 0}</p>
                      <span className={styles.secPrice}>
                        ₹{data?.Product_Ori_Price || 0}
                      </span>
                    </div>
                  </div>
                </Col>
              ))}
            </Slider>
          </Col>
        )}

        <div></div>
        {categoryFeature?.length <= 4 ? (
          <div
            style={{
              padding: "100px 0",
            }}
          >
            <h2
              style={{
                textAlign: "center",
              }}
            >
              IN THE SPOTLIGHT
            </h2>
            <Col
              xs={22}
              md={22}
              lg={22}
              xl={22}
              xxl={22}
              className={styles.wear1}
            >
              {categoryFeature?.map((data, index) => (
                <div className={styles.slider} key={index}>
                  <Image
                    src={data.category_Image}
                    preview={false}
                    alt="ellips"
                    onClick={() => Catagory(data)}
                  />
                  <p>{data.category_Name}</p>
                </div>
              ))}
            </Col>
          </div>
        ) : (
          <Col
            xs={22}
            md={22}
            lg={22}
            xl={22}
            xxl={22}
            className={styles.couraselMain}
            style={{
              padding: "100px 0",
            }}
          >
            <h2
              style={{
                textAlign: "center",
                paddingBottom: 50,
              }}
            >
              IN THE SPOTLIGHT
            </h2>
            <Slider {...settings} className={styles.handlecourasel}>
              {categoryFeature?.map((data, index) => (
                <div className={styles.slider} key={index}>
                  <Image
                    src={data.category_Image}
                    preview={false}
                    alt="ellips"
                    onClick={() => Catagory(data)}
                  />
                  <p>{data.category_Name}</p>
                </div>
              ))}
            </Slider>
          </Col>
        )}

        {productFeatureListing2?.length <= 4 ? (
          <Col xs={22} md={22} lg={22} xl={22} xxl={22} className={styles.wear}>
            <h2>BEST SELLING PRODUCTS</h2>
            <Row justify="start">
              {productFeatureListing2?.map((item, index) => (
                <Col xl={6} xxl={6} className={styles.setMain}>
                  <div className={styles.slider} key={index}>
                    {userToken ? (
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
                    ) : (
                      ""
                    )}
                    <Image
                      src={item?.Product_Image}
                      preview={false}
                      alt="Product_Image"
                      onClick={() =>
                        handleAddCart(item?._id, item?.Product_Name)
                      }
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
        ) : (
          <Col
            xs={22}
            md={22}
            lg={22}
            xl={22}
            xxl={22}
            className={styles.wearSet}
          >
            <h2>BEST SELLING PRODUCTS</h2>
            <Slider {...settings3} className={styles.smain}>
              {productFeatureListing2?.map((data, index) => (
                <Col lg={24} xl={6} xxl={6}>
                  <div className={styles.slider} key={index}>
                    {userToken ? (
                      <div className={styles.hearticon}>
                        {getProductIsLikedOrNot(data?._id) ? (
                          <HeartFilled
                            className={styles.pink}
                            onClick={() => {
                              toggleLike(data?._id);
                            }}
                          />
                        ) : (
                          <HeartOutlined
                            className={styles.normal}
                            onClick={() => {
                              toggleLike(data?._id);
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      ""
                    )}
                    <Image
                      src={data?.Product_Image || logo2}
                      preview={false}
                      alt="Product_Image"
                      onClick={() =>
                        handleAddCart(data?._id, data?.Product_Name)
                      }
                    />
                    <p>{data?.Product_Name}</p>
                    <div className={styles.prices}>
                      <p>₹{data?.Product_Dis_Price || 0}</p>
                      <span className={styles.secPrice}>
                        ₹{data?.Product_Ori_Price || 0}
                      </span>
                    </div>
                  </div>
                </Col>
              ))}
            </Slider>
          </Col>
        )}

        <Row className={styles.banner}>
          <Col xs={24} md={12} lg={12}>
            {profileData?.User_Type === "1" ||
            profileData?.User_Type === "2" ||
            profileData?.User_Type === "3" ? (
              <Image
                style={{ height: "100%", width: "100%" }}
                src={thankyou}
                alt="reseller"
                preview={false}
              />
            ) : (
              <img
                style={{ height: "100%", width: "100%" }}
                src={reseller}
                alt="reseller"
                preview={false}
              />
            )}
          </Col>
          <Col xs={24} md={12} lg={12}>
            {settingVideo?.app_youtube_video ? (
              <ReactPlayer
                url={
                  "https://www.youtube.com/watch?v=" +
                  settingVideo?.app_youtube_video
                }
                className={styles.video}
              />
            ) : (
              <Image src={simple} alt="simple" preview={false} />
            )}{" "}
          </Col>
        </Row>

        <Col xs={24} md={24} lg={24} xl={24} xxl={24} className={styles.banner}>
          <Slider {...settings2} className={styles.bannercourasel}>
            {bannerPrpduct?.map((item, index) => (
              <>
                <Image
                  key={index}
                  src={item?.banner_Image}
                  alt="banner_Image"
                  preview={false}
                  onClick={() =>
                    handleAddCart(item?.productId, item?.productName)
                  }
                />
              </>
            ))}
          </Slider>
        </Col>

        {productFeatureListing3?.length <= 4 ? (
          <Col xs={22} md={22} lg={22} xl={22} xxl={22} className={styles.wear}>
            <h2>POPULAR PICKS</h2>
            <Row justify="start">
              {productFeatureListing3?.map((item, index) => (
                <Col xl={6} xxl={6} className={styles.setMain}>
                  <div className={styles.slider} key={index}>
                    {userToken ? (
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
                    ) : (
                      ""
                    )}
                    <Image
                      src={item?.Product_Image}
                      preview={false}
                      alt="Product_Image"
                      onClick={() =>
                        handleAddCart(item?._id, item?.Product_Name)
                      }
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
        ) : (
          <Col
            xs={22}
            md={22}
            lg={22}
            xl={22}
            xxl={22}
            className={styles.wearSet}
          >
            <h2>POPULAR PICKS</h2>
            <Slider {...settings3} className={styles.smain}>
              {productFeatureListing3?.map((data, index) => (
                <Col lg={24} xl={6} xxl={6}>
                  <div className={styles.slider} key={index}>
                    {userToken ? (
                      <div className={styles.hearticon}>
                        {getProductIsLikedOrNot(data?._id) ? (
                          <HeartFilled
                            className={styles.pink}
                            onClick={() => {
                              toggleLike(data?._id);
                            }}
                          />
                        ) : (
                          <HeartOutlined
                            className={styles.normal}
                            onClick={() => {
                              toggleLike(data?._id);
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      ""
                    )}
                    <Image
                      src={data?.Product_Image || logo2}
                      preview={false}
                      alt="Product_Image"
                      onClick={() =>
                        handleAddCart(data?._id, data?.Product_Name)
                      }
                    />
                    <p>{data?.Product_Name}</p>
                    <div className={styles.prices}>
                      <p>₹{data?.Product_Dis_Price || 0}</p>
                      <span className={styles.secPrice}>
                        ₹{data?.Product_Ori_Price || 0}
                      </span>
                    </div>
                  </div>
                </Col>
              ))}
            </Slider>
          </Col>
        )}
        {/* <Col
          xs={24}
          md={24}
          lg={24}
          xl={24}
          xxl={24}
          className={styles.banner0}
        >
          <Image
            src={manaali}
            alt="manaali"
            preview={false}
            style={{ width: "100%", height: "auto", marginBottom: "50px" }}
          />
        </Col> */}
        <Col
          style={{ backgroundColor: "#ebe8e7" }}
          xs={22}
          md={22}
          lg={22}
          xl={22}
          xxl={22}
          className={styles.banner2}
        >
          {/* <Image src={customer} alt="customer" preview={false} /> */}
          <CustomerReview />
        </Col>
        <Col
          xs={22}
          md={22}
          lg={22}
          xl={22}
          xxl={22}
          className={styles.reseller}
        >
          <div style={{ flex: 1 }}>
            <img src={simple} alt="simple" preview={false} />
          </div>
          <div style={{ flex: 1 }}>
            <div className={styles.details}>
              <img
                src={logo}
                alt="logo"
                preview={false}
                // className={styles.logo}
              />
              <p>
                Step into a world of elegance with Shubh Libaas!
                <br /> Elevate your style effortlessly by downloading
                <br /> the Shubh Libaas app
              </p>
              <br />
              <br />
              <div>
                <Image
                  src={playstore}
                  alt="logo"
                  preview={false}
                  className={styles.google}
                  onClick={() =>
                    window.open(
                      "https://play.google.com/store/apps/details?id=com.shubhlibaas&pli=1"
                    )
                  }
                />
                <Image
                  src={appstore}
                  alt="logo"
                  preview={false}
                  className={styles.google}
                  onClick={() =>
                    window.open(
                      "https://apps.apple.com/in/app/shubh-libaas/id6468953659"
                    )
                  }
                />
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <PopupModal />
    </div>
  );
}

export default memo(Home);
