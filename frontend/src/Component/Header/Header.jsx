import {
  Badge,
  Button,
  Col,
  Divider,
  Dropdown,
  Image,
  Input,
  Menu,
  Row,
  Tooltip,
} from "antd";
import { routes } from "../../Routes/Routes";
import { useNavigate } from "react-router-dom";
import {
  HeartOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  getProfileApi,
  logout,
  setCartCount,
  setLikeCount,
} from "../../Features/User/User";

import cart from "../../Assets/PNG/cart.png";
import user from "../../Assets/PNG/profile.png";
import heart from "../../Assets/PNG/like.png";
import { getCategoryApi } from "../../Features/Category/Category";
import { getSearchProductApi } from "../../Features/Product/Product";
import styles from "./index.module.scss";
import { getWishListApi } from "../../Features/WishList/WishList";
import { geCartListApi } from "../../Features/AddCart/AddCart";
import Marquee from "react-fast-marquee";
import axios from "axios";
import { apiUrl } from "../../Constant";
import MegaMenu from "./MegaMenu/MegaMenu";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchType, setSearchType] = useState();
  const [text, setText] = useState("");
  const userId = useSelector((state) => state.user?.userId);
  const cartCounter = useSelector((state) => state.user?.cartCount);
  console.log(cartCounter, "cartCounter");
  const likeCounter = useSelector((state) => state.user?.likeCount);
  const profileData = useSelector((state) => state.user?.profileData);
  const userToken = useSelector((state) => state.user?.token);
  const cartlist = useSelector((state) => state.addCart?.cartListData);
  const wishlist = useSelector((state) => state.wishList?.wishlist2);

  useEffect(() => {
    dispatch(getCategoryApi());
    dispatch(getProfileApi(userToken));
    dispatch(getSearchProductApi(searchType, userId ? userId : 0));
    dispatch(getWishListApi(userToken));
    dispatch(geCartListApi(userToken));
  }, []);

  useEffect(() => {
    async function getExistingMarquee() {
      try {
        const response = await axios.get(apiUrl.GET_MARQUEE);
        console.log("marquee text ==> ", response.data);
        setText(response.data.marquee.text);
      } catch (error) {
        console.error(error);
      }
    }

    getExistingMarquee();
  }, [userToken]);

  const handlesubmit = () => {
    navigate(routes.homepageUrl);
    window.location.reload();
  };

  const handleCart = () => {
    // if (cartCounter > 0) {
    if (userToken) {
      navigate(routes.shoppingUrl);
    }
    // window.location.reload();
    // }
  };

  const Like = () => {
    if (userToken) {
      navigate(routes.likeUrl);
    }
  };

  const handleReset = () => {
    dispatch(logout());
    navigate(routes.userUrl);
    dispatch(setLikeCount(0));
    dispatch(setCartCount(0));
    window.location.reload();
  };

  const handleInputChange = (e) => {
    setSearchType(e);
    const onSuccessCallback = (res) => {
      if (res.products?.length > 0) {
        navigate(routes.search);
      }
    };
    dispatch(getSearchProductApi(e, userId ? userId : 0, onSuccessCallback));
  };

  const dropDownMenu = (
    <Menu
      items={[
        {
          label: (
            <>
              {userId ? (
                <>
                  <p
                    style={{ fontSize: "16px", fontWeight: "700", margin: "0" }}
                  >
                    Hello {profileData?.User_Name}
                  </p>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "500",
                      margin: "0",
                      marginBottom: "10px",
                    }}
                  >
                    {profileData?.User_Mobile_No}
                  </p>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "500",
                      margin: "0",
                      marginBottom: "10px",
                      background: "#DAA520",
                      borderRadius: "10px",
                      textAlign: "center",
                      width: "50%",
                    }}
                  >
                    {profileData?.User_Type === "1"
                      ? "Gold"
                      : profileData?.User_Type === "2"
                      ? "Silver"
                      : profileData?.User_Type === "3"
                      ? "PPO"
                      : ""}
                  </p>

                  <div>
                    <Button
                      style={{
                        border: "1px solid gainsboro",
                        borderRadius: "0",
                        color: "purple",
                        width: "100%",
                        height: "45px",
                        fontWeight: "600",
                        fontSize: "16px",
                      }}
                      onClick={() => {
                        navigate(routes.signupUrl, {
                          state: {
                            update: true,
                          },
                        });
                      }}
                    >
                      UPDATE PROFILE
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: "18px", fontWeight: "700" }}>Welcome</p>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "400",
                      marginTop: "-20px",
                    }}
                  >
                    To access account and manage orders
                  </p>
                  <div>
                    <Button
                      style={{
                        border: "1px solid gainsboro",
                        borderRadius: "0",
                        color: "red",
                        width: "70%",
                        height: "40px",
                        fontWeight: "600",
                        fontSize: "16px",
                      }}
                      onClick={() => {
                        navigate(routes.userUrl);
                      }}
                    >
                      LOGIN / SIGNUP
                    </Button>
                  </div>
                </>
              )}
              <div
                style={{
                  border: "1px solid gainsboro",
                  marginTop: "20px",
                  padding: "0",
                }}
              ></div>
            </>
          ),
          key: "0",
        },

        {
          label: (
            <>
              {userId ? (
                <div
                  onClick={() => {
                    handleReset();
                  }}
                  style={{ fontWeight: "600", fontSize: "16px" }}
                >
                  Logout
                </div>
              ) : (
                ""
              )}
            </>
          ),
          key: "3",
        },
      ]}
    />
  );

  const navigationMenu = [
    {
      label: "Order",
      key: "1",
      onClick: () => navigate(routes.orderUrl),
    },
    {
      label: "Wish List",
      key: "2",
      onClick: () => navigate(routes.likeUrl),
    },
    {
      label: "My Address",
      key: "3",
      onClick: () => navigate(routes.addressUrl),
    },
    {
      label: "Wallet History",
      key: "4",
      onClick: () => navigate(routes.walletUrl),
    },
    {
      label: "Rewards History",
      key: "5",
      onClick: () => navigate(routes.coinsUrl),
    },
    {
      label: "Notifications History",
      key: "6",
      onClick: () => navigate(routes.notificationUrl),
    },
    {
      label: "Logout",
      key: "7",
      onClick: handleReset,
    },
  ];

  const navigationBottomMenu = [
    {
      label: "Home",
      key: "1",
      onClick: () => navigate(routes.homepageUrl),
    },
    {
      label: "About Us",
      key: "2",
      onClick: () => navigate(routes.aboutUrl),
    },
    {
      label: "Jewelllery",
      key: "3",
      onClick: () => navigate(routes.shoppingUrl),
    },
    {
      label: "Watches",
      key: "4",
      onClick: () => navigate(routes.walletUrl),
    },
    {
      label: "Refund and Exchanges Policy",
      key: "5",
      onClick: () => navigate(routes.refundUrl),
    },
    {
      label: "Contact Us",
      key: "6",
      onClick: () => navigate(routes.contactUrl),
    },
    {
      label: "Logout",
      key: "7",
      onClick: handleReset,
    },
  ];

  const CategoryMenu = [
    {
      title: "Anklet",
      items: [
        "Beaded ankle",
        "Braided ankle",
        "Demi fine ankle",
        "String ankle",
      ],
    },
    {
      title: "Earring",
      items: ["Armill", "Brooch", "Button", "Diadem"],
    },
    {
      title: "Rings",
      items: ["Emblem", "Findings", "Puzzle jewelry", "Mamuli"],
    },
    {
      title: "Barrette",
      items: ["Belt buckle", "Pendant", "Choker", "Necklace"],
    },
    {
      title: "Prayer Jewellery",
      items: ["Diamond Rings", "Gold Rings", "Rose Gold Rings", "Silver Rings"],
    },
    {
      title: "Bracelet",
      items: ["Alert Jewelry", "Amulet", "Breastplate", "Gold Bracelet"],
    },
  ];

  const [hovered, setHovered] = useState(null);

  const mobileDropDownMenu = (
    <Menu
      items={[
        {
          label: (
            <>
              {userId ? (
                <>
                  <p
                    style={{ fontSize: "16px", fontWeight: "700", margin: "0" }}
                  >
                    Hello {profileData?.User_Name}
                  </p>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "500",
                      margin: "0",
                      marginBottom: "10px",
                    }}
                  >
                    {profileData?.User_Mobile_No}
                  </p>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "500",
                      margin: "0",
                      marginBottom: "10px",
                      background: "#DAA520",
                      borderRadius: "10px",
                      textAlign: "center",
                      width: "50%",
                    }}
                  >
                    {profileData?.User_Type === "1"
                      ? "Gold"
                      : profileData?.User_Type === "2"
                      ? "Silver"
                      : profileData?.User_Type === "3"
                      ? "PPO"
                      : ""}
                  </p>

                  <div>
                    <Button
                      style={{
                        border: "1px solid gainsboro",
                        borderRadius: "0",
                        color: "purple",
                        width: "100%",
                        height: "45px",
                        fontWeight: "600",
                        fontSize: "16px",
                      }}
                      onClick={() => {
                        navigate(routes.signupUrl, {
                          state: {
                            update: true,
                          },
                        });
                      }}
                    >
                      UPDATE PROFILE
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: "18px", fontWeight: "700" }}>Welcome</p>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "400",
                      marginTop: "-20px",
                    }}
                  >
                    To access account and manage orders
                  </p>
                  <div>
                    <Button
                      style={{
                        border: "1px solid gainsboro",
                        borderRadius: "0",
                        color: "red",
                        width: "70%",
                        height: "40px",
                        fontWeight: "600",
                        fontSize: "16px",
                      }}
                      onClick={() => {
                        navigate(routes.userUrl);
                      }}
                    >
                      LOGIN / SIGNUP
                    </Button>
                  </div>
                </>
              )}
              <div
                style={{
                  border: "1px solid gainsboro",
                  marginTop: "20px",
                  padding: "0",
                }}
              ></div>
            </>
          ),
          key: "0",
        },
        {
          label: (
            <>
              {userId ? (
                <div
                  onClick={() => {
                    navigate(routes.orderUrl);
                  }}
                  style={{ fontWeight: "600", fontSize: "16px" }}
                >
                  Order
                </div>
              ) : (
                <div>Order</div>
              )}
            </>
          ),
          key: "1",
        },
        {
          label: (
            <>
              {userId ? (
                <div
                  onClick={() => {
                    navigate(routes.likeUrl);
                  }}
                  style={{ fontWeight: "600", fontSize: "16px" }}
                >
                  Wish List
                </div>
              ) : (
                <div>Wish List</div>
              )}
            </>
          ),
          key: "2",
        },
        {
          label: (
            <>
              {userId ? (
                <div
                  onClick={() => {
                    navigate(routes.addressUrl);
                  }}
                  style={{ fontWeight: "600", fontSize: "16px" }}
                >
                  My Address
                </div>
              ) : (
                <div>My Address</div>
              )}
            </>
          ),
          key: "4",
        },
        {
          label: (
            <>
              {userId ? (
                <div
                  onClick={() => {
                    navigate(routes.walletUrl);
                  }}
                  style={{ fontWeight: "600", fontSize: "16px" }}
                >
                  Wallet History
                </div>
              ) : (
                <div> Wallet History</div>
              )}
            </>
          ),
          key: "11",
        },
        {
          label: (
            <>
              {userId ? (
                <div
                  onClick={() => {
                    navigate(routes.coinsUrl);
                  }}
                  style={{ fontWeight: "600", fontSize: "16px" }}
                >
                  Rewards History
                </div>
              ) : (
                <div> Coins History</div>
              )}
            </>
          ),
          key: "12",
        },
        {
          label: (
            <>
              {userId ? (
                <div
                  onClick={() => {
                    navigate(routes.notificationUrl);
                  }}
                  style={{ fontWeight: "600", fontSize: "16px" }}
                >
                  Notifications History
                </div>
              ) : (
                <div> Notification History</div>
              )}
            </>
          ),
          key: "13",
        },
        {
          label: (
            <>
              {userId ? (
                <div
                  onClick={() => {
                    handleReset();
                  }}
                  style={{ fontWeight: "600", fontSize: "16px" }}
                >
                  Logout
                </div>
              ) : (
                ""
              )}
            </>
          ),
          key: "3",
        },
      ]}
    />
  );

  return (
    <div style={{ overflow: "hidden" }}>
      {/* <Marquee className={styles.offer}>{text}</Marquee> */}
      <Row
        justify="space-between"
        align={"middle"}
        className={styles.headerSpacing}
        style={{ background: "#121212", color: "#fff" }}
      >
        <Col>
          <p style={{ margin: 0 }}>
            Free shipping world wide for all orders over $199
          </p>
        </Col>
        <Col xs={0} md={15} lg={15} xl={12} xxl={12} className={styles.navMenu}>
          <Row justify="space-around">
            {navigationMenu.map((item) => (
              <Col key={item.key}>
                <div
                  onClick={item.onClick}
                  style={{ cursor: "pointer", color: "#fff" }}
                  className={styles.navItem}
                >
                  {item.label}
                </div>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
      <Row className={styles.headermain}>
        <Col xs={24} md={24} lg={24} xl={24} xxl={24}>
          <Row
            justify="space-between"
            align={"middle"}
            className={styles.headerSpacing}
          >
            <Col className={styles.searchinput2}>
              <Input
                size="large"
                placeholder="Search Here"
                suffix={<SearchOutlined />}
                onChange={(e) => handleInputChange(e.target.value)}
                style={{
                  backgroundColor: "#f5f5f5",
                  border: "none",
                  borderRadius: "2px",
                  width: 350,
                  height: 50,
                }}
              />
            </Col>
            <Col className={styles.headerlogo} onClick={handlesubmit}>
              <p
                style={{
                  color: "#000",
                  textTransform: "uppercase",
                  fontWeight: "700",
                  margin: 0,
                  fontSize: 30,
                  textAlign: "center",
                }}
              >
                Xclusive Diamonds
              </p>
            </Col>

            <Col>
              <Row
                style={{ gap: 30, width: 350 }}
                justify="center"
                align={"middle"}
              >
                <Col xs={0} md={0} lg={1} xl={1} xxl={1}>
                  <Dropdown overlay={dropDownMenu} trigger={["click"]}>
                    <div
                      className={styles.hrDropdown}
                      onClick={(e) => e.preventDefault()}
                    >
                      <UserOutlined
                        style={{ fontSize: 30, color: "#121212" }}
                      />
                    </div>
                  </Dropdown>
                </Col>
                <Col xs={0} md={0} lg={1} xl={1} xxl={1}>
                  <Badge
                    style={{ backgroundColor: "#FF9800" }}
                    showZero
                    count={wishlist > 0 ? wishlist : 0}
                    className={styles.badge}
                  >
                    <HeartOutlined
                      onClick={Like}
                      style={{ fontSize: 30, color: "#121212" }}
                    />
                  </Badge>
                </Col>
                <Col
                  xs={0}
                  md={0}
                  lg={1}
                  xl={1}
                  xxl={1}
                  className={styles.headericon}
                >
                  <Badge
                    style={{ backgroundColor: "#FF9800" }}
                    showZero
                    count={cartlist?.Count > 0 ? cartlist?.Count : 0}
                    className={styles.badge}
                  >
                    <ShoppingCartOutlined
                      onClick={handleCart}
                      style={{ fontSize: 30, color: "#121212" }}
                    />
                  </Badge>
                </Col>

                <Col
                  xs={8}
                  md={8}
                  lg={4}
                  xl={3}
                  xxl={4}
                  className={styles.headericon2}
                >
                  <Dropdown overlay={mobileDropDownMenu} trigger={["click"]}>
                    <div
                      className={styles.hrDropdown}
                      onClick={(e) => e.preventDefault()}
                    >
                      <Image src={user} alt="profile" preview={false} />
                    </div>
                  </Dropdown>
                  {likeCounter ? (
                    <Badge
                      style={{ backgroundColor: "#FF9800" }}
                      showZero
                      count={wishlist > 0 ? wishlist : 0}
                      className={styles.badge}
                    >
                      <Image
                        src={heart}
                        alt="like"
                        preview={false}
                        onClick={Like}
                      />
                    </Badge>
                  ) : (
                    <Tooltip>
                      <Badge
                        style={{ backgroundColor: "#FF9800" }}
                        showZero
                        count={wishlist > 0 ? wishlist : 0}
                        className={styles.badge}
                      >
                        <Image
                          src={heart}
                          alt="like"
                          preview={false}
                          onClick={Like}
                        />
                      </Badge>
                    </Tooltip>
                  )}
                  {cartCounter ? (
                    <Badge
                      style={{ backgroundColor: "#FF9800" }}
                      showZero
                      count={cartlist?.Count > 0 ? cartlist?.Count : 0}
                      className={styles.badge}
                    >
                      <Image
                        src={cart}
                        alt="shopping"
                        preview={false}
                        onClick={handleCart}
                      />
                    </Badge>
                  ) : (
                    <Tooltip>
                      <Badge
                        style={{ backgroundColor: "#FF9800" }}
                        showZero
                        count={cartlist?.Count > 0 ? cartlist?.Count : 0}
                        className={styles.badge}
                      >
                        <Image
                          src={cart}
                          alt="shopping"
                          preview={false}
                          onClick={handleCart}
                        />
                      </Badge>
                    </Tooltip>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>

          <Divider style={{ background: "#e9e9e9", margin: 0 }} />

          <Row justify="center" align="middle" className={styles.headerSpacing}>
            <Col
              xs={0}
              md={15}
              lg={15}
              xl={12}
              xxl={12}
              className={styles.navMenu}
            >
              <Row justify="space-around">
                {navigationBottomMenu.map((item) => (
                  <Col
                    key={item.key}
                    onMouseEnter={() => setHovered(item.key)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ position: "relative" }}
                  >
                    <div
                      onClick={item.onClick}
                      style={{
                        cursor: "pointer",
                        color: "#121212",
                        textTransform: "capitalize",
                        fontSize: 14,
                        fontWeight: "500",
                      }}
                      className={styles.navItem}
                    >
                      {item.label}
                    </div>

                    {item.label === "Jewelllery" && (
                      <MegaMenu data={CategoryMenu} />
                    )}
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default Header;
