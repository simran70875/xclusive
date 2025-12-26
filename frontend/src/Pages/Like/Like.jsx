import { Button, Col, Row } from "antd";
import { routes } from "../../Routes/Routes";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setLikeCount } from "../../Features/User/User";
import { getWishListApi } from "../../Features/WishList/WishList";

import styles from "./index.module.scss";
import { ProductCard } from "../../Component/productCard";

function Like() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userToken = useSelector((state) => state.user?.token);
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

  const back = () => {
    navigate(routes.homepageUrl);
  };

  return (
    <div>
      {givewishlist?.length > 0 ? (
        <Row justify="center" className={styles.mainLine}>
          <Col xs={22} md={22} lg={22} xl={22} xxl={22} className={styles.wear}>
            <h2 className={styles.sectionTitle}>Your Favorites</h2>
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
                  <ProductCard item={item} />
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            height: 300,
          }}
        >
          <p
            style={{
              fontSize: "20px",
              textAlign: "center",
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
        </div>
      )}
    </div>
  );
}

export default Like;
