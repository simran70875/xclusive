import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import styles from "../Pages/HomePage/index.module.scss";
import { addWishList, getWishListApi } from "../Features/WishList/WishList";
import { Image } from "antd";

export const ProductCard = ({ item }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const userToken = useSelector((state) => state.user?.token);

  const likeCounter = useSelector((state) => state.user?.likeCount);
  const givewishlist = useSelector((state) => state.wishList?.wishlist);

  const toggleLike = (value) => {
    const obj = {
      productId: value,
    };
    const onSuccessCallback = () => {
      if (isLiked === false) {
        dispatch(getWishListApi(userToken));
        setIsLiked(!isLiked);
      } else {
        if (likeCounter > 0) {
          dispatch(getWishListApi(userToken));
        }
      }
    };
    dispatch(addWishList(obj, onSuccessCallback, userToken));
  };
  const getProductIsLikedOrNot = (id) =>
    Boolean(givewishlist?.find((e) => e._id == id));

  const handleAddCart = (id, name) => {
    navigate(`/product-detail/${name}`, {
      state: {
        productId: id,
      },
    });
    window.location.reload();
  };

  return (
    <div className={styles.slider}>
      {userToken && (
        <div className={styles.hearticon}>
          {getProductIsLikedOrNot(item?._id) ? (
            <HeartFilled
              className={styles.pink}
              onClick={() => toggleLike(item?._id)}
            />
          ) : (
            <HeartOutlined
              className={styles.normal}
              onClick={() => toggleLike(item?._id)}
            />
          )}
        </div>
      )}

      <Image
        preview={false}
        src={item?.Product_Image}
        alt="Product_Image"
        onClick={() => handleAddCart(item?._id, item?.Product_Name)}
      />

      <p className={styles.capetalizeText}>{item?.Category}</p>
      <p className={styles.capetalizeText}>{item?.Product_Name}</p>

      <div className={styles.prices}>
        <p>
          £{item?.price || 0}{" "}
          <span className={styles.secPrice}>£{item?.price || 0} </span>
        </p>
      </div>
    </div>
  );
};
