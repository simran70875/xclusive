import { useEffect } from "react";
import Slider from "react-slick";
import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Image, Row, Typography, Space, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import Marquee from "react-fast-marquee";

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
import { getSettingApi } from "../../Features/Setting/Setting";
import { getProfileApi } from "../../Features/User/User";
import { getCategoryFeatureApi } from "../../Features/Category/Category";
import { getWishListApi } from "../../Features/WishList/WishList";

import styles from "./index.module.scss";
import PopupModal from "./PopupModal";
import { getSpecificationApi } from "../../Features/Specification/Specification";
import { ProductCard } from "../../Component/productCard";
import { apiUrl } from "../../Constant";
import axios from "axios";
import { useState } from "react";
import {
  SafetyCertificateOutlined,
  CarOutlined,
  CreditCardOutlined,
  UndoOutlined,
} from "@ant-design/icons";

const brands = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Casio_logo.svg/960px-Casio_logo.svg.png",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbPFitaPXFnKhkolz7OH6UMbLk-GrCl1uv9g&s",
  "https://images-aka.ernestjones.co.uk/Homepage/logos/01_330x120_EJ2310W07_Homepage_Logos_boss_v2.jpg",
  "https://images-aka.ernestjones.co.uk/Homepage/logos/330x120_EJ2504W01_Tissot.jpg",
  "https://images-aka.ernestjones.co.uk/Homepage/images/brand-logos/03_330x120_EJ2310W07_Homepage_Logos_longines.jpg",
  "https://images-aka.ernestjones.co.uk/Homepage/images/brand-logos/02_330x120_EJ2310W07_Homepage_Logos_gucci.jpg",
  "https://images-aka.ernestjones.co.uk/campaigns/2024/gift_with_purchase/330x120_EJ2310WC14_Tudor.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Garmin_logo_2006.svg/1200px-Garmin_logo_2006.svg.png",
];

const FeatureSection = () => {
  const { Title, Text } = Typography;
  const features = [
    {
      icon: <CarOutlined />,
      title: "Global Shipping",
      desc: "Fully insured door-to-door delivery.",
    },
    {
      icon: <SafetyCertificateOutlined />,
      title: "Certified Purity",
      desc: "GIA certified conflict-free diamonds.",
    },
    {
      icon: <CreditCardOutlined />,
      title: "Secure Payment",
      desc: "Encrypted checkout with luxury financing.",
    },
    {
      icon: <UndoOutlined />,
      title: "30-Day Returns",
      desc: "Hassle-free luxury exchange policy.",
    },
  ];

  return (
    <Col
      xs={22}
      md={22}
      lg={22}
      xl={22}
      xxl={22}
      className={styles.featureSection}
    >
      <div className={styles.container}>
        <Row gutter={[32, 32]} justify="center">
          {features.map((item, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <div className={styles.featureBox}>
                <div className={styles.iconWrapper}>{item.icon}</div>
                <Title level={5} className={styles.featureTitle}>
                  {item.title}
                </Title>
                <Text className={styles.featureDesc}>{item.desc}</Text>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </Col>
  );
};

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { Title, Text, Paragraph } = Typography;
  const { SpecificationData } = useSelector((state) => state.specification);
  const [text, setText] = useState("");

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
  const bannerPrpduct = useSelector((state) => state.banner?.bannerProductData);

  const featureCats = useSelector(
    (state) => state.category?.categoryFeatureData
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    dispatch(getCategoryFeatureApi());
    dispatch(getSpecificationApi());

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

  useEffect(() => {
    async function getExistingMarquee() {
      try {
        const response = await axios.get(apiUrl.GET_MARQUEE);
        setText(response.data.marquee.text);
      } catch (error) {
        console.error(error);
      }
    }

    getExistingMarquee();
  }, [userToken]);

  const handleAddCart = (id, name) => {
    navigate(`/product-detail/${name}`, {
      state: {
        productId: id,
      },
    });
  };

  const Catagory = (item) => {
    navigate(`/product/${item?.category_Name || item?.categoryName}`, {
      state: {
        item: item?.category_Name || item?.categoryName,
        id: item?.category_id || item?.categoryId,
      },
    });
  };

  const Colloection = (item) => {
    navigate(`/product/${item?.Data_Name}`, {
      state: {
        item: item?.Data_Name,
        id: item?._id,
      },
    });
  };

  let settingsCat = {
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
          slidesToShow: 7,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 426,
        settings: {
          slidesToShow: 2,
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

  let settings = {
    dots: true,
    infinite: true,
    speed: 2500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 100,

    responsive: [
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: 4,
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
    // speed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
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
        <Col
          xs={24}
          md={24}
          lg={24}
          xl={24}
          xxl={24}
          style={{ padding: "50px 0" }}
        >
          <Slider {...settingsCat} className={styles.handlecourasel}>
            {featureCats?.map((data, index) => (
              <div key={index}>
                <div onClick={() => Catagory(data)}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div className={styles.Catagory}>
                      <img src={data.category_Image} alt={data.category_Name} />
                    </div>

                    <p
                      className={`${styles.specName} ${styles.capetalizeText}`}
                    >
                      {data.category_Name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </Col>
        <Col xs={24} md={24} lg={24} xl={24} xxl={24} className={styles.banner}>
          <Slider {...settings2} className={styles.bannercourasel}>
            {banner?.map((item, index) => (
              <div key={index}>
                <Image
                  preview={false}
                  key={index}
                  src={item?.banner_Image}
                  alt="banner_Image"
                  // onClick={() => Catagory(item)}
                />
              </div>
            ))}
          </Slider>
        </Col>

        <Col
          xs={24}
          md={24}
          lg={24}
          xl={24}
          xxl={24}
          className={styles.couraselMain}
          // style={{ padding: "20px 0" }}
        >
          {/* <Slider {...settings} className={styles.handlecourasel}>
            {SpecificationData?.map((data, index) => (
              <div key={index}>
                <div
                  onClick={() => Colloection(data)}
                  className={`${styles.specBox} ${styles[`bg${index % 5}`]}`}
                >
                  <div>
                    <p className={styles.specName}>{data.Data_Name}</p>

                    <p className={styles.productCount}>
                      {data.productsCount || 0} Products
                    </p>
                  </div>

                  <button className={styles.exploreBtn}>
                    Explore Collection
                  </button>
                </div>
              </div>
            ))}
          </Slider> */}

          <Slider {...settings} className={styles.handlecourasel}>
            {SpecificationData?.map((data, index) => (
              <div key={index} className={styles.carouselItemWrapper}>
                <div
                  onClick={() => Colloection(data)}
                  className={`${styles.darkCard} ${
                    styles[`gradient${index % 4}`]
                  }`}
                >
                  {/* Layer 1: The Fixed Shape/Pattern Background */}
                  <div className={styles.shapeOverlay}></div>

                  {/* Layer 2: Subtle Glass Noise/Texture */}
                  <div className={styles.glassTexture}></div>

                  {/* Layer 3: Content */}
                  <div className={styles.contentLayer}>
                    <div className={styles.textGroup}>
                      <span className={styles.topBadge}>Collection</span>
                      <h3 className={styles.premiumTitle}>{data.Data_Name}</h3>
                      <p className={styles.itemCount}>
                        {data.productsCount || 0} Exclusive Pieces
                      </p>
                    </div>

                    <button className={styles.premiumBtn}>
                      <span>Explore</span>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </Col>

        {productFeatureListing1?.length <= 4 ? (
          <Col xs={22} md={22} lg={22} xl={22} xxl={22} className={styles.wear}>
            <h2 className={styles.sectionTitle}>Trending Products</h2>

            <Row justify="start">
              {productFeatureListing1?.map((item, index) => (
                <Col
                  key={index}
                  lg={24}
                  xl={6}
                  xxl={6}
                  className={styles.setMain}
                >
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
            <h2 className={styles.sectionTitle}>Trending Products</h2>

            <Slider {...settings3} className={styles.smain}>
              {productFeatureListing1?.map((item, index) => (
                <Col key={index} lg={24} xl={6} xxl={6}>
                  <ProductCard item={item} />
                </Col>
              ))}
            </Slider>
          </Col>
        )}

        <Col
          xs={22}
          md={22}
          lg={22}
          xl={22}
          xxl={22}
          className={styles.aboutSection}
        >
          <div className={styles.container}>
            <Row gutter={[60, 40]} align="middle">
              {/* Image Side */}
              <Col xs={24} lg={12}>
                <div className={styles.imageCompositor}>
                  <div className={styles.mainImageWrapper}>
                    <img
                      src="https://manubhai.in/SocialMedia/post_artworks/DIBD09963.jpg?ver=2.1"
                      alt="Crafting Diamonds"
                      className={styles.mainImage}
                    />
                  </div>

                  <div className={styles.floatingBadge}>
                    <Text className={styles.badgeYear}>EST.</Text>
                    <Text className={styles.badgeDate}>1998</Text>
                  </div>
                </div>
              </Col>

              {/* Content Side */}
              <Col xs={24} lg={12}>
                <Space
                  direction="vertical"
                  size="large"
                  className={styles.contentArea}
                >
                  <div>
                    <Text className={styles.overline}>Our Heritage</Text>
                    <Title level={2} className={styles.aboutTitle}>
                      Crafting the Extraordinary <br />
                      <span className={styles.goldText}>Since 1998</span>
                    </Title>
                  </div>

                  <Paragraph className={styles.description}>
                    At Exclusive Diamond, we don't just sell jewelry; we
                    preserve memories. Every stone is hand-selected by our
                    master gemologists, ensuring that each cut reflects the
                    maximum brilliance possible.
                  </Paragraph>

                  <Paragraph className={styles.description}>
                    Our signature "Nude Cut" collection focuses on the raw,
                    aesthetic beauty of diamonds, set in ethically sourced
                    metals that celebrate your unique story with timeless
                    elegance.
                  </Paragraph>

                  <div className={styles.statsRow}>
                    <div className={styles.statItem}>
                      <Title level={3} className={styles.statNum}>
                        25+
                      </Title>
                      <Text className={styles.statLabel}>Years of Mastery</Text>
                    </div>
                    <div className={styles.statItem}>
                      <Title level={3} className={styles.statNum}>
                        10k+
                      </Title>
                      <Text className={styles.statLabel}>Unique Designs</Text>
                    </div>
                  </div>

                  <Button size="large" className={styles.luxuryButton}>
                    Explore Our Story
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>
        </Col>

        <Col
          xs={24}
          md={24}
          lg={24}
          xl={24}
          xxl={24}
          style={{ paddingBottom: 50 }}
        >
          {/* <h2 className={styles.sectionTitle}>Featured Brand</h2> */}

          <Slider {...settingsCat} className={styles.handlecourasel}>
            {brands?.map((brand, index) => (
              <div key={index}>
                <div
                  style={{
                    height: 50,
                    width: 200,
                    border: "1px solid #e9e9e9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px 0",
                  }}
                >
                  <img
                    style={{
                      objectFit: "contain",
                      height: 40,
                      width: "80%",
                    }}
                    src={brand}
                    alt={brand}
                  />
                </div>
              </div>
            ))}
          </Slider>
        </Col>

        {productFeatureListing2?.length <= 4 ? (
          <Col xs={22} md={22} lg={22} xl={22} xxl={22} className={styles.wear}>
            <h2 className={styles.sectionTitle}>Best Selling Products</h2>

            <Row justify="start">
              {productFeatureListing2?.map((item, index) => (
                <Col
                  key={index}
                  lg={24}
                  xl={6}
                  xxl={6}
                  className={styles.setMain}
                >
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
            <h2 className={styles.sectionTitle}>Best Selling Products</h2>

            <Slider {...settings3} className={styles.smain}>
              {productFeatureListing2?.map((item, index) => (
                <Col key={index} lg={24} xl={6} xxl={6}>
                  <ProductCard item={item} />
                </Col>
              ))}
            </Slider>
          </Col>
        )}

        <Col xs={24} md={24} lg={24} xl={24} xxl={24} className={styles.banner}>
          <Marquee className={styles.offer}>{text}</Marquee>
          <Row gutter={[16, 16]}>
            {bannerPrpduct?.map((item, index) => (
              <Col
                key={index}
                span={index === 0 ? 24 : 8} // 24 = full width, 8 = 3 columns
                xs={24}
                sm={index === 0 ? 24 : 12}
                md={index === 0 ? 24 : 8}
              >
                <Image
                  preview={false}
                  src={item?.banner_Image}
                  alt="banner_Image"
                  style={{
                    width: "100%",
                    height: "auto",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    handleAddCart(item?.productId, item?.productName)
                  }
                />
              </Col>
            ))}
          </Row>
        </Col>

        {productFeatureListing3?.length <= 4 ? (
          <Col
            xs={22}
            md={22}
            lg={22}
            xl={22}
            xxl={22}
            className={styles.wear}
            style={{ paddingTop: 50 }}
          >
            <h2 className={styles.sectionTitle}>Popular Picks</h2>

            <Row justify="start">
              {productFeatureListing3?.map((item, index) => (
                <Col
                  key={index}
                  lg={24}
                  xl={6}
                  xxl={6}
                  className={styles.setMain}
                >
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
            style={{ paddingTop: 50 }}
          >
            <h2 className={styles.sectionTitle}>Popular Picks</h2>

            <Slider {...settings3} className={styles.smain}>
              {productFeatureListing3?.map((item, index) => (
                <Col key={index} lg={24} xl={6} xxl={6}>
                  <ProductCard item={item} />
                </Col>
              ))}
            </Slider>
          </Col>
        )}

        <FeatureSection />

        <section className={styles.parallaxContainer}>
          {/* Overlay creates contrast so text is readable on the image */}
          <div className={styles.darkOverlay}></div>

          <div className={styles.centerContent}>
            <Text className={styles.miniTitle}>Timeless Elegance</Text>

            <Title level={1} className={styles.mainHeading}>
              Exquisite Diamonds for Every Moment
            </Title>

            <p className={styles.tagline}>
              Rare brilliance crafted into your unique story.
            </p>

            <Button
              onClick={() => {
                navigate("/product/all");
              }}
              size="large"
              className={styles.luxuryButton}
            >
              Shop Now
            </Button>
          </div>
        </section>
      </Row>
      <PopupModal />
    </div>
  );
}

export default memo(Home);
