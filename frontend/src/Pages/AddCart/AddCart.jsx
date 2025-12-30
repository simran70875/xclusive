import Slider from "react-slick";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Col, Image, Rate, Row, Tabs } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

import Review from "../Review/Review";
import {
  getProductIdApi,
  productNotifyApi,
} from "../../Features/Product/Product";
import { routes } from "../../Routes/Routes";
import Description from "../Description/Description";
import { addCartApi } from "../../Features/AddCart/AddCart";
import { getProductReviewApi } from "../../Features/Setting/Setting";
import { addWishList, getWishListApi } from "../../Features/WishList/WishList";

import styles from "./index.module.scss";
import { ProductCard } from "../../Component/productCard";

function AddCart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();

  const userID = useSelector((state) => state.user?.userId);
  const userToken = useSelector((state) => state.user?.token);
  const likeCounter = useSelector((state) => state.user?.likeCount);
  const productIdData = useSelector((state) => state.product?.productIdData);
  const loader = useSelector((state) => state.addCart?.isAddCartLoad);
  const loaderFev = useSelector((state) => state.wishList?.wishListLoading);
  const likeProductList = useSelector(
    (state) => state.product?.productFeatureListLike
  );

  const [variationData, setVariationData] = useState();
  const [variationSizes, setVariationSizes] = useState([]);

  const [isLiked, setIsLiked] = useState(false);
  const [hightLight, setHighLight] = useState(0);

  const [imgArr, setImgArr] = useState([]);
  const [singleImg, setSingleImg] = useState("");

  const [variationId, setVariationId] = useState("");
  const [variationName, setVariationName] = useState();

  const [sizeName, setSizeName] = useState();
  const [qty, setQty] = useState(1);
  const [stockCount, setStockCount] = useState();
  const [originalPrice, setOriginalPrice] = useState(0);
  const [discountPrice, setDiscountPrice] = useState(0);
  const [purity, setPurity] = useState("");

  const [isSizeSelected, setIsSizeSelected] = useState(false);

  useEffect(() => {
    dispatch(getProductIdApi(state?.productId, userID ? userID : 0));
    dispatch(getProductReviewApi(state?.productId, userToken));
    window.scrollTo(0, 0);
  }, [dispatch, state?.productId, userID]);

  useEffect(() => {
    if (
      productIdData?.variation?.length === 0 ||
      productIdData?.variation?.[0]?.variation_Sizes?.length === 0
    )
      setQty(0);
    window.scrollTo(0, 0);
  }, [productIdData]);

  const Incree = () => {
    setQty(qty + 1);
  };

  const Decree = () => {
    if (qty > 0) {
      setQty(qty - 1);
    }
  };

  const addCart = () => {
    const cartobj = {
      product: state?.productId,
      variation: variationId,
      SizeName: sizeName,
      purity: purity,
      Quantity: qty,
    };

    const onSuccessCallback = (res) => {
      if (res.type === "success") {
      } else {
        navigate(routes.loginUrl);
      }
    };

    dispatch(addCartApi(cartobj, onSuccessCallback, userToken));
  };

  const handleSize = (size) => {
    setIsSizeSelected(true);
    setSizeName(size.name);
    setStockCount(size.stock);
    setOriginalPrice(size.price);
    setDiscountPrice(size.discountPrice);
    setPurity(size.purity);
  };

  const items = [
    {
      key: "1",
      label: "Description",
      children: <Description descriptions={productIdData?.Description} />,
    },
    // {
    //   key: "2",
    //   label: "Reviews",
    //   children: <Review productReview={productReview} />,
    // },
  ];

  const handleOnClickVariation = (
    variationData,
    singleImage,
    imageArr,
    variationSizes,
    variationId,
    variationName
  ) => {
    setVariationData(variationData);
    setVariationName(variationName);
    setVariationSizes(variationSizes);
    setSingleImg(singleImage);
    setImgArr(imageArr);
    setVariationId(variationId);
    handleSize(variationSizes[0]);
  };

  useEffect(() => {
    if (!productIdData?.variation?.length) return;

    const variationData = productIdData.variation[0];
    const singleImage = variationData?.variation_Images[0]?.variation_Image;
    const imageArr = variationData?.variation_Images;
    const variationSizes = variationData?.variation_Sizes;
    const variationId = variationData?.variation_Id;
    const variationName = variationData?.variation_Name;
    const variationSize = variationData?.variation_Sizes[0];

    setVariationData(variationData);
    setStockCount(variationSizes?.[0]?.stock);
    setVariationName(variationName);
    setVariationSizes(variationSizes);
    setSingleImg(singleImage);
    setImgArr(imageArr);
    setVariationId(variationId);
    setSizeName(variationSize?.name);
    setOriginalPrice(variationSize?.price);
  }, [productIdData]);

  const handleSingleImage = (singleImg) => {
    setSingleImg(singleImg);
  };

  const toggleLike = (value, fev) => {
    const obj = {
      productId: value,
    };
    const onSuccessCallback = () => {
      if (isLiked === false || fev === false) {
        dispatch(getWishListApi(userToken));
        setIsLiked(!isLiked);
      } else {
        if (likeCounter > 0) {
          setIsLiked(!isLiked);

          dispatch(getWishListApi(userToken));
        }
      }
    };
    dispatch(addWishList(obj, onSuccessCallback, userToken));
  };

  const home = () => {
    navigate(routes.loginUrl);
  };

  const handleProductNotify = () => {
    const obj = {
      productId: state?.productId,
      variation: variationId,
      size: sizeName,
    };
    if (isSizeSelected) {
      const onSuccessCallback = () => {};
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
    <Row justify="center" className={styles.welMain}>
      <Col
        xs={22}
        md={22}
        lg={22}
        xl={22}
        xxl={22}
        style={{
          paddingTop: 50,
        }}
      >
        <Row justify="center">
          <Col
            xs={12}
            md={12}
            lg={12}
            xl={12}
            xxl={12}
            className={styles.addcart}
          >
            <div>
              <Image
                preview={false}
                src={
                  singleImg
                    ? singleImg
                    : productIdData?.variation?.[0]?.variation_Images?.[0]
                        ?.variation_Image || productIdData?.Product_Image
                }
                alt="add image"
                className={styles.cartImg}
              />
              <Col lg={22} xl={22} xxl={22}>
                <Slider className={styles.couraselMain}>
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
                            imgArr?.map((qty, index) => (
                              <>
                                <div
                                  className={styles.slider}
                                  key={index}
                                  onClick={() =>
                                    handleSingleImage(qty?.variation_Image)
                                  }
                                >
                                  <Image
                                    preview={false}
                                    src={qty?.variation_Image}
                                    alt="ellips"
                                  />
                                </div>
                              </>
                            ))}
                        </>
                      ) : (
                        <>
                          {variationData?.variation_Images &&
                            variationData?.variation_Images?.map(
                              (qty, index) => (
                                <>
                                  <div
                                    className={styles.slider}
                                    key={index}
                                    onClick={() =>
                                      handleSingleImage(qty?.variation_Image)
                                    }
                                  >
                                    <Image
                                      preview={false}
                                      src={qty?.variation_Image}
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
          </Col>
          <Col
            xs={12}
            md={12}
            lg={12}
            xl={12}
            xxl={12}
            className={styles.addcart}
            style={{
              padding: "0 30px",
            }}
          >
            <div className={styles.sider}>
              <div className={styles.rating}>
                <Rate allowHalf disabled defaultValue={5} />
                <p>5 | Reviews</p>
              </div>
              <p
                className={styles.Foil}
                style={{
                  textTransform: "capitalize",
                }}
              >
                {productIdData?.Product_Name}
              </p>
              <div className={styles.prices}>
                <p className={styles.price1}>£{originalPrice}</p>

                {!variationData || stockCount <= 0 || variationData <= 0 ? (
                  <span className={styles.price30}>Out Of-stock</span>
                ) : (
                  <span className={styles.price3}>In-stock</span>
                )}
              </div>
              <div className={styles.names}>
                <div>
                  <p className={styles.brand}>SKU Code: - </p>{" "}
                  <span className={styles.ganga}>
                    {productIdData?.SKU_Code}
                  </span>
                </div>
                <div>
                  <p className={styles.brand}>Collection - </p>{" "}
                  <span className={styles.ganga}>
                    {productIdData?.Brand_Name} {productIdData?.Collections}
                  </span>
                </div>
              </div>

              <div className={styles.setcolor}>
                {productIdData?.variation?.length > 0 && <p>Color:</p>}
                <div>
                  {productIdData?.variation?.map((item, index) => (
                    <div style={{ paddingBottom: 20 }} key={index}>
                      <div
                        onClick={() => {
                          setHighLight(index);
                          handleOnClickVariation(
                            item,
                            item?.variation_Images[0]?.variation_Image,
                            item?.variation_Images,
                            item?.variation_Sizes,
                            item?.variation_Id,
                            item?.variation_Name
                          );
                        }}
                        className={
                          hightLight === index
                            ? styles.colorImg
                            : styles.colorImg2
                        }
                      >
                        <Image
                          preview={false}
                          key={index}
                          src={item?.variation_Images[0]?.variation_Image}
                          alt="color1"
                          onClick={() => setHighLight(index)}
                        />
                      </div>
                      <p
                        style={{
                          textAlign: "center",
                          fontSize: 12,
                          fontWeight: "normal",
                        }}
                        className={styles.ganga}
                      >
                        {item?.variation_Name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {variationSizes?.length > 0 && (
                <div className={styles.setbtn}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <p>Size:</p>
                    <p
                      style={{
                        textDecorationLine: "underline",
                      }}
                    >
                      Size Guide
                    </p>
                  </div>

                  <div>
                    {variationSizes?.map((itm, index) => (
                      <Button
                        key={index}
                        onClick={() => handleSize(itm)}
                        className={
                          sizeName
                            ? sizeName === itm.name
                              ? styles.xs
                              : styles.xs2
                            : index === 0
                            ? styles.xss
                            : styles.xs2
                        }
                      >
                        {itm.name} ({itm.purity})
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {userToken ? (
                <>
                  {stockCount <= 0 ? (
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
                      <p>Select Quantity</p>
                      <div className={styles.incree}>
                        <Button onClick={Decree} className={styles.decree}>
                          -
                        </Button>
                        <p className={styles.showdata}>{qty}</p>
                        <Button
                          disabled={qty >= stockCount}
                          onClick={() => Incree()}
                          className={styles.incre2}
                        >
                          +
                        </Button>
                      </div>

                      <div className={styles.add}>
                        <Button
                          className={styles.cart}
                          onClick={() => addCart()}
                          disabled={
                            variationData?.variation_Sizes?.length === 0 ||
                            qty === 0
                          }
                          loading={loader}
                        >
                          ADD TO CART
                        </Button>
                        <Button
                          className={styles.favourite}
                          onClick={() =>
                            toggleLike(
                              state?.productId,
                              productIdData?.isFavorite
                            )
                          }
                          loading={loaderFev}
                        >
                          {isLiked || productIdData?.isFavorite
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

              {/* <div className={styles.share}>
                <p>Share On :</p>
                <div className={styles.setround}>
                  <div
                    onClick={() => window.open("https://www.instagram.com/")}
                  >
                    <InstagramOutlined
                      style={{
                        fontSize: 30,
                        cursor: "pointer",
                      }}
                    />
                  </div>
                  <div onClick={() => window.open("https://www.facebook.com/")}>
                    <FacebookOutlined
                      style={{
                        fontSize: 30,
                        cursor: "pointer",
                      }}
                    />
                  </div>
                  <div onClick={() => window.open("https://www.linkedin.com/")}>
                    <LinkedinOutlined
                      style={{
                        fontSize: 30,
                        cursor: "pointer",
                      }}
                    />
                  </div>
                  <div onClick={() => window.open("https://www.whatsapp.com/")}>
                    <WhatsAppOutlined
                      style={{
                        fontSize: 30,
                        cursor: "pointer",
                      }}
                    />
                  </div>
                </div>
              </div> */}
            </div>
          </Col>
        </Row>
      </Col>

      <div
        style={{
          padding: "50px 0",
        }}
      ></div>

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
          // indicatorSize={(origin) => origin - 16}
          className={styles.tabs}
        />
      </Col>

      {likeProductList?.length <= 4 ? (
        <Col xs={22} md={22} lg={22} xl={22} xxl={22} className={styles.wear}>
          <h2>YOU MAY ALSO LIKE</h2>
          <Row justify="start">
            {likeProductList?.map((item, index) => (
              <Col xl={6} xxl={6} className={styles.setMain}>
                <ProductCard item={item} />
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
            {likeProductList?.map((item, index) => (
              <Col lg={24} xl={6} xxl={6}>
                <ProductCard item={item} />
              </Col>
            ))}
          </Slider>
        </Col>
      )}
    </Row>
  );
}

export default AddCart;
