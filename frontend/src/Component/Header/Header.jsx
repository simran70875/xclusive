import {
  Badge,
  Button,
  Col,
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
import styles from "./index.module.scss";

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
import { getWishListApi } from "../../Features/WishList/WishList";
import { geCartListApi } from "../../Features/AddCart/AddCart";

// import Marquee from "react-fast-marquee";
// import axios from "axios";
// import { apiUrl } from "../../Constant";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchType, setSearchType] = useState();
  const userId = useSelector((state) => state.user?.userId);
  const cartCounter = useSelector((state) => state.user?.cartCount);
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

  const catagoryItem = useSelector((state) => state.category?.categoryData);

  const Catagory = (item) => {
    navigate(`/product/${item?.category_Name || item?.categoryName}`, {
      state: {
        item: item?.category_Name || item?.categoryName,
        id: item?.category_id || item?.categoryId,
      },
    });
    window.location.reload();
  };

  // useEffect(() => {
  //   async function getExistingMarquee() {
  //     try {
  //       const response = await axios.get(apiUrl.GET_MARQUEE);
  //       console.log("marquee text ==> ", response.data);
  //       setText(response.data.marquee.text);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   }

  //   getExistingMarquee();
  // }, [userToken]);

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
    // if (likeCounter > 0) {
    if (userToken) {
      navigate(routes.likeUrl);
    }
    // }
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
    <div className="">
      {/* <Marquee className={styles.offer}>{text}</Marquee> */}

      {userId && (
        <Row
          style={{ background: "#000", padding: 20 }}
          justify="space-between"
        >
          <Col xs={6} md={6} lg={6} xl={6} xxl={6}>
            <div
              style={{ cursor: "pointer", color: "#fff" }}
              className={styles.navItem}
            >
              Free Shipping world wide for all order above $99
            </div>
          </Col>

          <Col xs={18} md={18} lg={18} xl={18} xxl={18}>
            <Row justify="end" align={"middle"} gutter={30}>
              {navigationMenu.map((item, index) => (
                <Col key={index}>
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
      )}

      <Row className={styles.headermain} justify="space-between">
        <Col
          xs={8}
          md={8}
          lg={8}
          xl={8}
          xxl={8}
          className={styles.searchinput2}
        >
          <Input
            size="large"
            placeholder="Search Here"
            style={{
              backgroundColor: "#e9e9e9",
              width: "60%",
            }}
            suffix={<SearchOutlined />}
            onChange={(e) => handleInputChange(e.target.value)}
          />
        </Col>

        <Col
          xs={8}
          md={8}
          lg={8}
          xl={8}
          xxl={8}
          className={styles.headerlogo}
          onClick={handlesubmit}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image preview={false} src={"/logo.png"} alt="logo" />
        </Col>

        <Col xs={8} md={8} lg={8} xl={8} xxl={8} className={styles.headericon}>
          <Dropdown menu={dropDownMenu} trigger={["click"]}>
            <div
              className={styles.hrDropdown}
              onClick={(e) => e.preventDefault()}
            >
              <UserOutlined
                style={{
                  color: "#000",
                  fontSize: 20,
                }}
              />
            </div>
          </Dropdown>
          <div
            style={{
              padding: 10,
            }}
          ></div>

          <Badge
            style={{ backgroundColor: "#FF9800" }}
            showZero
            count={wishlist > 0 ? wishlist : 0}
            className={styles.badge}
          >
            <HeartOutlined
              style={{
                color: "#000",
                fontSize: 20,
              }}
              onClick={Like}
            />
          </Badge>
          <div
            style={{
              padding: 10,
            }}
          ></div>

          <Badge
            style={{ backgroundColor: "#FF9800" }}
            showZero
            count={cartlist?.Count > 0 ? cartlist?.Count : 0}
            className={styles.badge}
          >
            <ShoppingCartOutlined
              style={{
                color: "#000",
                fontSize: 20,
              }}
              onClick={handleCart}
            />
          </Badge>
        </Col>

        {/* // tablet size */}
        <Col xs={8} md={8} lg={4} xl={3} xxl={4} className={styles.headericon2}>
          <Dropdown menu={mobileDropDownMenu} trigger={["click"]}>
            <div
              className={styles.hrDropdown}
              onClick={(e) => e.preventDefault()}
            >
              <Image preview={false} src={user} alt="profile" />
            </div>
          </Dropdown>
          {likeCounter ? (
            <Badge
              style={{ backgroundColor: "#FF9800" }}
              showZero
              count={wishlist > 0 ? wishlist : 0}
              className={styles.badge}
            >
              <Image preview={false} src={heart} alt="like" onClick={Like} />
            </Badge>
          ) : (
            <Tooltip>
              <Badge
                style={{ backgroundColor: "#FF9800" }}
                showZero
                count={wishlist > 0 ? wishlist : 0}
                className={styles.badge}
              >
                <Image preview={false} src={heart} alt="like" onClick={Like} />
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
              <Image preview={false} src={cart} alt="shopping" onClick={handleCart} />
            </Badge>
          ) : (
            <Tooltip>
              <Badge
                style={{ backgroundColor: "#FF9800" }}
                showZero
                count={cartlist?.Count > 0 ? cartlist?.Count : 0}
                className={styles.badge}
              >
                <Image preview={false} src={cart} alt="shopping" onClick={handleCart} />
              </Badge>
            </Tooltip>
          )}
        </Col>
      </Row>

      <Row
        style={{ padding: 20, borderBottom: "1px solid #e9e9e9" }}
        justify="space-between"
      >
        <Col xs={24} md={24} lg={24} xl={24} xxl={24}>
          <Row justify="center" align={"middle"} gutter={50}>
            {catagoryItem?.map((item, index) => (
              <Col
                key={index}
                style={{
                  textAlign: "center",
                }}
              >
                <Image preview={false}
                  style={{
                    height: 50,
                    width: 50,
                    borderRadius: "50%",
                  }}
                  src={item.category_Image}
                  alt={item.category_Name}
                  onClick={() => Catagory(item)}
                />
                <div
                  onClick={item.onClick}
                  style={{ cursor: "pointer", color: "#555" }}
                  className={styles.navItem}
                >
                  {item.category_Name}
                </div>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default Header;
