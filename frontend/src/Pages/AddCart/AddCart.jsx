import Slider from "react-slick";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Col, Image, Rate, Row, Tabs } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FacebookOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";

import Review from "../Review/Review";
import {
  getProductIdApi,
  getProductListApi,
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
  const [imgArr, setImgArr] = useState([]);
  const [firstData, setFirstData] = useState();

  const [variationName, setVariationName] = useState();

  const [firstData2, setFirstData2] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [singleImg, setSingleImg] = useState("");
  const [hightLight, setHighLight] = useState(0);
  const [sizeButton, setSizeButton] = useState();
  const [data, setData] = useState(1);
  const [stockCont, setStockCount] = useState();
  const [variationId, setVariationId] = useState("");
  const [variationSize, setVariationSize] = useState([]);
  const [variationSize2, setVariationSize2] = useState([]);
  const [variationSize3, setVariationSize3] = useState(null);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [discountPrice, setDiscountPrice] = useState(0);
  const [colorName, setColorName] = useState();
  const [isSizeSelected, setIsSizeSelected] = useState(false);

  const productReview = useSelector(
    (state) => state.setting?.productReviewData
  );
  const likeProductList = useSelector(
    (state) => state.product?.productFeatureListLike
  );
  const userID = useSelector((state) => state.user?.userId);
  const userToken = useSelector((state) => state.user?.token);
  const likeCounter = useSelector((state) => state.user?.likeCount);
  
  const productIdData = useSelector((state) => state.product?.productIdData);

  console.log("product data ==> ", productIdData);

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
        window.location.reload();
      } else {
        navigate(routes.loginUrl);
        window.location.reload();
      }
    };

    dispatch(addCartApi(cartobj, onSuccessCallback, userToken));
  };

  const onChange = (key) => {
    // console.log(key);
  };

  const handleSize = (sizeName, stock) => {
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
      if (isLiked === false || fev === false) {
        window.location.reload();
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
      variation: variationId || variationName,
      size: variationSize3 || firstData?.variation_Sizes?.[0]?.name,
    };
    if (isSizeSelected || variationSize3) {
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
                key={index}
                src={
                  singleImg
                    ? singleImg
                    : productIdData?.variation?.[0]?.variation_Images?.[0]
                        ?.variation_Image || value.Product_Image
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
                                    preview={false}
                                    src={data?.variation_Image}
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
                                    preview={false}
                                    src={data?.variation_Image}
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
              <p
                className={styles.Foil}
                style={{
                  textTransform: "capitalize",
                }}
              >
                {value?.Product_Name}
              </p>
              <div className={styles.prices}>
                <p className={styles.price1}>£{value?.Price}</p>

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
                    </div>
                  ))}
                </div>
              </div>

              {variationSize?.length > 0 ? (
                <div className={styles.setbtn}>
                  <p>Size:</p>

                  <div>
                    {variationSize?.map((itm, index) => (
                      <Button
                        key={index}
                        onClick={() => handleSize(itm.name, itm?.stock)}
                        className={
                          sizeButton
                            ? sizeButton === itm.name
                              ? styles.xs
                              : styles.xs2
                            : index === 0
                            ? styles.xss
                            : styles.xs2
                        }
                      >
                        {itm?.name} ({itm.purity})
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.setbtn}>
                  {firstData?.variation_Sizes.length > 0 && <p>Size:</p>}
                  <div>
                    {firstData?.variation_Sizes?.map((itm, index) => (
                      <Button
                        key={index}
                        onClick={() => handleSize(itm.name, itm?.stock)}
                        className={
                          sizeButton
                            ? sizeButton === itm.name
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
                  </div>
                </div>
              )}

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
                              Incree(value?.Price, value?.Product_Ori_Price)
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
              </div>
              <div className={styles.share}>
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
              </div>
            </div>
          </Col>
        </Row>
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
