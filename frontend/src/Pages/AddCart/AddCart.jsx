/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import Slider from "react-slick";
import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Col, Image, Rate, Row, Tabs } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";

import Review from "../Review/Review";
import {
  getProductIdApi,
  getProductListApi,
  productNotifyApi,
} from "../../Features/Product/Product";
import { routes } from "../../Routes/Routes";
import addlast from "../../Assets/PNG/addlast.png";
import instagram from "../../Assets/PNG/instagram.png";
import facebook from "../../Assets/PNG/facebook.png";
import linkedin from "../../Assets/PNG/linkedin.png";
import whatsapp from "../../Assets/PNG/whatsapp.png";
import Description from "../Description/Description";
import { addCartApi } from "../../Features/AddCart/AddCart";
import { getProductReviewApi } from "../../Features/Setting/Setting";
import { setCartCount, setLikeCount } from "../../Features/User/User";
import { addWishList, getWishListApi } from "../../Features/WishList/WishList";

import styles from "./index.module.scss";

function AddCart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();
  const [imgArr, setImgArr] = useState([]);
  const [firstData, setFirstData] = useState();
  console.log("firstData ==>", firstData);
  const [variationName, setVariationName] = useState();
  const [firstData2, setFirstData2] = useState(0);
  // console.log("firstData2", firstData2);
  const [isLiked, setIsLiked] = useState(false);
  const [singleImg, setSingleImg] = useState("");
  const [hightLight, setHighLight] = useState(0);
  const [sizeButton, setSizeButton] = useState();
  // console.log("sizeButton", sizeButton);
  const [data, setData] = useState(1);
  const [stockCont, setStockCount] = useState();
  // const [checkStock, setCheckStock] = useState(false);
  // console.log("stockCont", stockCont);
  const [productId, setProductId] = useState(null);
  const [variationId, setVariationId] = useState("");
  const [variationSize, setVariationSize] = useState([]);
  // console.log("variationSize", variationSize);
  const [variationSize2, setVariationSize2] = useState([]);
  // console.log("variationSize2", variationSize2);
  const [variationSize3, setVariationSize3] = useState(null);
  // console.log("variationSize3", variationSize3);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [discountPrice, setDiscountPrice] = useState(0);
  const [colorName, setColorName] = useState();
  const [isSizeSelected, setIsSizeSelected] = useState(false);
  const productReview = useSelector(
    (state) => state.setting?.productReviewData
  );
  const similarProductList = useSelector(
    (state) => state.product?.productFeatureList
  );
  const likeProductList = useSelector(
    (state) => state.product?.productFeatureListLike
  );
  const userID = useSelector((state) => state.user?.userId);
  const userToken = useSelector((state) => state.user?.token);
  const likeCounter = useSelector((state) => state.user?.likeCount);
  const givewishlist = useSelector((state) => state.wishList?.wishlist);
  const productIdData = useSelector((state) => state.product?.productIdData);
  console.log("productIdData variation ===> ", productIdData?.[0]?.variation);
  console.log("productIdData variation_Sizes ===> ",productIdData?.[0]?.variation?.[0]?.variation_Sizes);
  const loader = useSelector((state) => state.addCart?.isAddCartLoad);
  const loaderFev = useSelector((state) => state.wishList?.wishListLoading);

  useEffect(() => {
    dispatch(getProductIdApi(state?.productId, userID ? userID : 0));

    window.scrollTo(0, 0);
  }, [dispatch, state?.productId, userID]);

  useEffect(() => {
    if (
      productIdData?.[0]?.variation?.length === 0 ||
      productIdData?.[0]?.variation?.[0]?.variation_Sizes?.length === 0
    )
      setData(0);
    window.scrollTo(0, 0);
  }, [productIdData]);

  useEffect(() => {
    setFirstData(productIdData?.[0]?.variation?.[0]);
    const firstDataStock =
      productIdData?.[0]?.variation?.[0]?.variation_Sizes?.[0]?.stock;
    setFirstData2(firstDataStock);
    setStockCount(firstDataStock);
    dispatch(
      getProductListApi(
        productIdData?.[0]?.CategoryId,
        userID ? userID : 0,
        state?.productId
      )
    );
    dispatch(getWishListApi(userToken));
    dispatch(getProductReviewApi(state?.productId, userToken));
    setVariationSize2(firstData?.variation_Sizes?.[0]?.stock);
    setVariationName(firstData?.variation_Id);
    window.scrollTo(0, 0);
  }, [productIdData]);

  const Incree = (prices, price2) => {
    setData(data + 1);
    setDiscountPrice(prices);
    setOriginalPrice(price2);
  };

  const Decree = () => {
    if (data > 0) {
      setData(data - 1);
    }
  };

  const addCart = () => {
    const cartobj = {
      SizeName: sizeButton ? sizeButton : firstData?.variation_Sizes?.[0]?.name,
      variation: variationId ? variationId : firstData?.variation_Id,
      Quantity: data,
      product: state?.productId,
      originalPrice: originalPrice,
      discountPrice: discountPrice,
    };

    const onSuccessCallback = (res) => {
      if (res.type === "success") {
        // dispatch(setCartCount(cartCounter + 1));
        // toast.success("Cartitem Added Successfully.")
        window.location.reload();
      } else {
        navigate(routes.userUrl);
        window.location.reload();
      }
    };
    // if (sizeButton) {
    dispatch(addCartApi(cartobj, onSuccessCallback, userToken));
    // }
  };

  const onChange = (key) => {
    // console.log(key);
  };

  const handleSize = (sizeName, stock) => {
    // console.log("/jlkbjhbhikjbn", sizeName, stock);
    // setData(0);
    setIsSizeSelected(true);
    setStockCount(stock);
    setSizeButton(sizeName);
    setVariationSize3(sizeName);
  };
  const items = [
    {
      key: "1",
      label: "Description",
      children: <Description descriptions={productIdData?.[0]?.Description} />,
    },
    {
      key: "2",
      label: "Reviews",
      children: <Review productReview={productReview} />,
    },
  ];

  const handleImage = (
    singleImage,
    imageArr,
    variationSize,
    variation,
    name
  ) => {
    setStockCount(variationSize?.[0]?.stock);
    setFirstData2(variationSize?.[0]?.stock);
    // console.log("check", singleImage, imageArr, variationSize, variation, name);
    // setData(0);
    setColorName(name);
    setVariationSize(variationSize);
    setVariationSize2(variationSize?.[0]?.stock);
    setSingleImg(singleImage);
    setImgArr(imageArr);
    setVariationId(variation);
    setSizeButton(null);
  };

  const handleSingleImage = (singleImg) => {
    setSingleImg(singleImg);
  };

  const toggleLike = (value, fev) => {
    const obj = {
      productId: value,
    };
    const onSuccessCallback = () => {
      // dispatch(getWishListApi(userToken));
      if (isLiked === false || fev === false) {
        window.location.reload();
        dispatch(getWishListApi(userToken));
        setIsLiked(!isLiked);
        // dispatch(setLikeCount(likeCounter + 1));
      } else {
        if (likeCounter > 0) {
          setIsLiked(!isLiked);
          // dispatch(setLikeCount(likeCounter - 1));
          dispatch(getWishListApi(userToken));
        }
      }
    };
    dispatch(addWishList(obj, onSuccessCallback, userToken));
  };

  const getProductIsLikedOrNot = (id) =>
    Boolean(givewishlist?.find((e) => e._id == id));

  const handleAddCart = (id, name) => {
    setProductId(id);
    navigate(`/product-detail/${name}`, {
      state: {
        productId: id,
      },
    });
    window.location.reload();
  };

  const home = () => {
    navigate(routes.userUrl);
  };

  const handleProductNotify = () => {
    const obj = {
      productId: state?.productId,
      variation: variationId || variationName,
      size: variationSize3 || firstData?.variation_Sizes?.[0]?.name,
      // size: variationSize?.[0]?.name || firstData?.variation_Sizes?.[0]?.name,
    };
    if (isSizeSelected || variationSize3) {
      const onSuccessCallback = () => {
        // toast.success("success");
      };
      dispatch(productNotifyApi(obj, onSuccessCallback, userToken));
    } else {
      toast.error("Please Select Size");
    }
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
      <Row justify="center" className={styles.welMain}>
        {productIdData?.map((value, index) => (
          <>
            <Col
              xs={22}
              md={22}
              lg={22}
              xl={22}
              xxl={22}
              className={styles.addcart}
            >
              <Image
                key={index}
                src={
                  singleImg
                    ? singleImg
                    : value?.variation?.[0]?.variation_Images?.[0]
                        ?.variation_Image || value.Product_Image
                }
                alt="add image"
                preview={false}
                className={styles.cartImg}
              />
              <div>
                <Col lg={22} xl={22} xxl={22}>
                  <Slider className={styles.couraselMain3}>
                    <Row
                      className={
                        userToken ? styles.fixcourasel : styles.fixcourasel2
                      }
                    >
                      <Col
                        lg={2}
                        xl={4}
                        xxl={4}
                        className={styles.handlecourasel}
                      >
                        {imgArr?.length > 0 ? (
                          <>
                            {imgArr &&
                              imgArr?.map((data, index) => (
                                <>
                                  <div
                                    className={styles.slider}
                                    key={index}
                                    onClick={() =>
                                      handleSingleImage(data?.variation_Image)
                                    }
                                  >
                                    <Image
                                      src={data?.variation_Image}
                                      preview={false}
                                      alt="ellips"
                                    />
                                  </div>
                                </>
                              ))}
                          </>
                        ) : (
                          <>
                            {firstData?.variation_Images &&
                              firstData?.variation_Images?.map(
                                (data, index) => (
                                  <>
                                    <div
                                      className={styles.slider}
                                      key={index}
                                      onClick={() =>
                                        handleSingleImage(data?.variation_Image)
                                      }
                                    >
                                      <Image
                                        src={data?.variation_Image}
                                        preview={false}
                                        alt="ellips"
                                      />
                                    </div>
                                  </>
                                )
                              )}
                          </>
                        )}
                      </Col>
                    </Row>
                  </Slider>
                </Col>
              </div>
              <div className={styles.sider}>
                <p className={styles.Foil}>{value?.Product_Name}</p>
                <div className={styles.prices}>
                  <p className={styles.price1}>₹{value?.Product_Dis_Price}</p>
                  <span className={styles.price2}>
                    ₹{value?.Product_Ori_Price}
                  </span>

                  {!firstData2 ||
                  // data >= stockCont ||
                  variationSize2 <= 0 ||
                  firstData2 <= 0 ? (
                    <span className={styles.price30}>Out Of-stock</span>
                  ) : (
                    <span className={styles.price3}>In-stock</span>
                  )}
                </div>
                <div className={styles.rating}>
                  <Rate allowHalf disabled defaultValue={value?.ratings} />
                  <p>{value?.ratings} | Reviews</p>
                </div>
                <div className={styles.setcolor}>
                  {value?.variation.length > 0 && <p>Color:</p>}
                  <div>
                    {value?.variation?.map((item, index) => (
                      <div style={{ paddingBottom: 20 }} key={index}>
                        <div
                          onClick={() => {
                            setHighLight(index);
                            handleImage(
                              item?.variation_Images[0]?.variation_Image,
                              item?.variation_Images,
                              item?.variation_Sizes,
                              value?.variation?.[index]?.variation_Id,
                              item?.variation_Name
                            );
                          }}
                          className={
                            hightLight === index ? styles.colorImg : styles.colorImg2
                          }
                        >
                          <Image
                            key={index}
                            src={item?.variation_Images[0]?.variation_Image}
                            alt="color1"
                            preview={false}
                            onClick={() => setHighLight(index)}
                          />
                        </div>
                        {/* <p>{item?.variation_Name}</p> */}
                        {/* <p>{hightLight}</p> */}
                      </div>
                    ))}
                  </div>
                </div>

                {variationSize?.length > 0 ? (
                  <div className={styles.setbtn}>
                    {variationSize.length > 0 && <p>Size:</p>}

                    <div>
                      {variationSize?.[0]?.name === "Unstitched Material" ? (
                        <>
                          {variationSize?.map((itm, index) => (
                            <Button
                              key={index}
                              onClick={() => handleSize(itm?.name, itm?.stock)}
                              className={
                                sizeButton === itm.name
                                  ? styles.xs3
                                  : styles.xs4
                              }
                            >
                              {itm?.name}
                            </Button>
                          ))}
                        </>
                      ) : (
                        <>
                          {variationSize?.map((itm, index) => (
                            <Button
                              key={index}
                              onClick={() => handleSize(itm.name, itm?.stock)}
                              className={
                                sizeButton ? sizeButton === itm.name
                                ? styles.xs
                                : styles.xs2
                              : index === 0
                              ? styles.xs
                              : styles.xs2
                              }
                            >
                              {itm?.name}
                            </Button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={styles.setbtn}>
                    {firstData?.variation_Sizes.length > 0 && <p>Size:</p>}
                    <div>
                      {firstData?.variation_Sizes?.[0]?.name ===
                      "Unstitched Material" ? (
                        <>
                          {firstData?.variation_Sizes?.map((itm, index) => (
                            <Button
                              key={index}
                              onClick={() => handleSize(itm.name, itm?.stock)}
                              className={
                                sizeButton === itm.name3
                                  ? styles.xs3
                                  : styles.xs4
                              }
                            >
                              {itm?.name}
                            </Button>
                          ))}
                        </>
                      ) : (
                        <>
                          {firstData?.variation_Sizes?.map((itm, index) => (
                            <Button
                              key={index}
                              onClick={() => handleSize(itm.name, itm?.stock)}
                              className={
                                sizeButton ? sizeButton === itm.name
                                    ? styles.xs
                                    : styles.xs2
                                  : index === 0
                                  ? styles.xs
                                  : styles.xs2
                              }
                            >
                              {itm?.name}
                            </Button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* {data >= stockCont &&
                    variationSize2 <= 0 &&
                    firstData2 <= 0 ? (
                      <div className={styles.add1}>
                        <Button
                          className={styles.userbtn}
                          onClick={() => handleProductNotify()}
                        >
                          Notify Me
                        </Button>
                      </div> */}
                {userToken ? (
                  <>
                    {variationSize2 <= 0 || firstData2 <= 0 ? (
                      <>
                        <div className={styles.add1}>
                          <Button
                            className={styles.userbtn}
                            onClick={() => handleProductNotify()}
                          >
                            Notify Me
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        {firstData2 > 0 && (
                          <div className={styles.incree}>
                            <Button onClick={Decree} className={styles.decree}>
                              -
                            </Button>
                            <p className={styles.showdata}>{data}</p>
                            <Button
                              // disabled={data >= stockCont}
                              disabled={data >= stockCont}
                              onClick={() =>
                                Incree(
                                  value?.Product_Dis_Price,
                                  value?.Product_Ori_Price
                                )
                              }
                              className={styles.incre2}
                            >
                              +
                            </Button>
                          </div>
                        )}

                        <div className={styles.add}>
                          <Button
                            className={styles.cart}
                            // {!firstData2 ||
                            //   // data >= stockCont ||
                            //   variationSize2 <= 0 ||
                            //   firstData2 <= 0 ? (
                            onClick={() => addCart()}
                            disabled={
                              firstData?.variation_Sizes.length === 0 ||
                              data === 0
                            }
                            loading={loader}
                          >
                            ADD TO CART
                          </Button>
                          <Button
                            className={styles.favourite}
                            onClick={() =>
                              toggleLike(state?.productId, value?.isFavorite)
                            }
                            loading={loaderFev}
                          >
                            {isLiked || value?.isFavorite
                              ? "REMOVE FROM FAVOURITE"
                              : "ADD TO FAVOURITE"}
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className={styles.add1}>
                      <Button className={styles.userbtn} onClick={home}>
                        Login | Register
                      </Button>
                    </div>
                  </>
                )}
                <div className={styles.names}>
                  <div>
                    <p className={styles.brand}>SKU Code: - </p>{" "}
                    <span className={styles.ganga}>{value?.SKU_Code}</span>
                  </div>
                  <div>
                    <p className={styles.brand}>Brand Name - </p>{" "}
                    <span className={styles.ganga}>{value?.Brand_Name}</span>
                  </div>
                  <div>
                    <p className={styles.brand}>Fabric Type - </p>{" "}
                    <span className={styles.ganga}>{value?.Fabric_Type}</span>
                  </div>
                  <div>
                    <p className={styles.brand}>Occasion - </p>{" "}
                    <span className={styles.ganga}>{value?.Occasions}</span>
                  </div>
                </div>
                <div className={styles.share}>
                  <p>Share On :</p>
                  <div className={styles.setround}>
                    <div
                      onClick={() => window.open("https://www.instagram.com/")}
                    >
                      <Image src={instagram} alt="instagram" preview={false} />
                    </div>
                    <div
                      onClick={() => window.open("https://www.facebook.com/")}
                    >
                      <Image src={facebook} alt="facebook" preview={false} />
                    </div>
                    <div
                      onClick={() => window.open("https://www.linkedin.com/")}
                    >
                      <Image src={linkedin} alt="linkedin" preview={false} />
                    </div>
                    <div
                      onClick={() => window.open("https://www.whatsapp.com/")}
                    >
                      <Image src={whatsapp} alt="whatsapp" preview={false} />
                    </div>
                  </div>
                </div>
                <div className={styles.lastimg}>
                  <Image preview={false} src={addlast} alt="addlast" />
                </div>
              </div>
            </Col>
            <Col lg={22} xl={22} xxl={22}>
              <Slider className={styles.couraselMain}>
                <Row
                  className={
                    userToken ? styles.fixcourasel : styles.fixcourasel2
                  }
                >
                  <Col lg={2} xl={4} xxl={4} className={styles.handlecourasel}>
                    {imgArr?.length > 0 ? (
                      <>
                        {imgArr &&
                          imgArr?.map((data, index) => (
                            <>
                              <div
                                className={styles.slider}
                                key={index}
                                onClick={() =>
                                  handleSingleImage(data?.variation_Image)
                                }
                              >
                                <Image
                                  src={data?.variation_Image}
                                  preview={false}
                                  alt="ellips"
                                />
                              </div>
                            </>
                          ))}
                      </>
                    ) : (
                      <>
                        {firstData?.variation_Images &&
                          firstData?.variation_Images?.map((data, index) => (
                            <>
                              <div
                                className={styles.slider}
                                key={index}
                                onClick={() =>
                                  handleSingleImage(data?.variation_Image)
                                }
                              >
                                <Image
                                  src={data?.variation_Image}
                                  preview={false}
                                  alt="ellips"
                                />
                              </div>
                            </>
                          ))}
                      </>
                    )}
                  </Col>
                </Row>
              </Slider>
            </Col>
            <Col
              xs={22}
              md={22}
              lg={22}
              xl={22}
              xxl={22}
              className={userToken ? styles.settabs2 : styles.settabs}
            >
              <Tabs
                defaultActiveKey="1"
                items={items}
                onChange={onChange}
                indicatorSize={(origin) => origin - 16}
                className={styles.tabs}
              />
            </Col>
          </>
        ))}

        {similarProductList?.length <= 4 ? (
          <Col xs={22} md={22} lg={22} xl={22} xxl={22} className={styles.wear}>
            <h2>SIMILAR PRODUCTS</h2>
            <Row justify="start">
              {similarProductList?.map((item, index) => (
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
            <h2>SIMILAR PRODUCTS</h2>
            <Slider {...settings3} className={styles.smain}>
              {similarProductList?.map((data, index) => (
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
                      src={data?.Product_Image}
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

        {likeProductList?.length <= 4 ? (
          <Col xs={22} md={22} lg={22} xl={22} xxl={22} className={styles.wear}>
            <h2>YOU MAY ALSO LIKE</h2>
            <Row justify="start">
              {likeProductList?.map((item, index) => (
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
            <h2>YOU MAY ALSO LIKE</h2>
            <Slider {...settings3} className={styles.smain}>
              {likeProductList?.map((data, index) => (
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
                      src={data?.Product_Image}
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
      </Row>
    </div>
  );
}

export default AddCart;
