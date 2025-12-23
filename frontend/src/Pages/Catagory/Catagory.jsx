import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Checkbox,
  Col,
  Image,
  Radio,
  Row,
  Select,
  Spin,
  Collapse,
} from "antd";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import ResponsivePagination from "react-responsive-pagination";

import {
  getFilterListApi,
  getFilterProductApi,
} from "../../Features/Product/Product";
import { addWishList, getWishListApi } from "../../Features/WishList/WishList";

import styles from "./index.module.scss";

function Catagory() {
  const { Panel } = Collapse;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [data, setData] = useState();
  const [sortData, setSortData] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  const [brandName, setBrandName] = useState([]);
  const [colorsData, setColorsData] = useState([]);
  const [rateWiseData, setRateWiseData] = useState([]);
  const [categoryData, setcategoryData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const userid = useSelector((state) => state.user?.userId);
  const userToken = useSelector((state) => state.user.token);
  const likeCounter = useSelector((state) => state.user?.likeCount);
  const loader = useSelector((state) => state.product.productLoading);

  const filterSideData = useSelector((state) => state.product?.filterList);
  const filterProducct = useSelector((state) => state.product?.filterProduct);
  const paginationData = useSelector((state) => state.product?.filterProduct2);
  const givewishlist = useSelector((state) => state.wishList?.wishlist);

  useEffect(() => {
    setData(state);
    dispatch(
      getFilterProductApi(
        state?.id,
        brandName,
        colorsData,
        rateWiseData,
        userid !== null ? userid : 0,
        sortData,
        currentPage
      )
    );
    dispatch(getFilterListApi());
    window.scrollTo(0, 0);
  }, [state]);

  useEffect(() => {
    dispatch(getFilterListApi());
  }, []);

  const onChange = (e, item, filterType) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      setCheckedItems((prevCheckedItems) => [...prevCheckedItems, item]);
    } else {
      setCheckedItems((prevCheckedItems) =>
        prevCheckedItems.filter((checkedItem) => checkedItem !== item)
      );
    }
    if (filterType === "color") {
      if (e.target.checked === true) {
        colorsData.push(item);
      } else {
        const index = colorsData.indexOf(item);
        if (index > -1) {
          colorsData.splice(index, 1);
        }
      }
      setColorsData(colorsData);
    } else if (filterType === "brands") {
      if (e.target.checked === true) {
        brandName.push(item);
      } else {
        const index = brandName.indexOf(item);
        if (index > -1) {
          brandName.splice(index, 1);
        }
      }
      setBrandName(brandName);
    } else if (filterType === "rateWise") {
      if (e.target.checked === true) {
        rateWiseData.push(item);
      } else {
        const index = rateWiseData.indexOf(item);
        if (index > -1) {
          rateWiseData.splice(index, 1);
        }
      }
      setRateWiseData(rateWiseData);
    } else if (filterType === "category") {
      if (e.target.checked === true) {
        categoryData.push(item);
      } else {
        const index = categoryData.indexOf(item);
        if (index > -1) {
          categoryData.splice(index, 1);
        }
      }
      setcategoryData(categoryData);
    }
    dispatch(
      getFilterProductApi(
        state?.id,
        brandName,
        colorsData,
        rateWiseData,
        userid !== null ? userid : 0,
        sortData,
        currentPage
      )
    );
  };

  const onChange2 = (e, item, filterType) => {
    setSelectedRate(item);

    if (filterType === "rateWise") {
      // Update rateWiseData with the newly selected value
      setRateWiseData([item]);
    }

    dispatch(
      getFilterProductApi(
        state?.id,
        brandName,
        colorsData,
        item,
        userid !== null ? userid : 0,
        sortData,
        currentPage
      )
    );
  };

  const handleChange = (e, filterType) => {
    setSortData(e);
    dispatch(
      getFilterProductApi(
        state?.id,
        brandName,
        colorsData,
        rateWiseData,
        userid !== null ? userid : 0,
        currentPage
      )
    );
  };

  const handleAddCart = (id, name) => {
    navigate(`/product-detail/${name}`, {
      state: {
        productId: id,
      },
    });
    window.location.reload();
  };

  const filterDropdown = (arr) => {
    const dropdownArray = [];
    for (let i = 0; i < arr?.length; i++) {
      let obj = arr[i];
      dropdownArray.push({
        value: obj,
        label: obj,
      });
    }
    return dropdownArray;
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

  const handleClear = () => {
    setCheckedItems([]);
    dispatch(
      getFilterProductApi(
        state?.id,
        brandName,
        colorsData,
        rateWiseData,
        userid !== null ? userid : 0,
        sortData,
        currentPage
      )
    );
    window.location.reload();
  };

  const getProductIsLikedOrNot = (id) =>
    Boolean(givewishlist?.find((e) => e._id == id));

  const onShowSizeChange = (current, pageSize) => {
    // console.log(current, pageSize);
    setCurrentPage(current);
    dispatch(
      getFilterProductApi(
        state?.id,
        brandName,
        colorsData,
        rateWiseData,
        userid !== null ? userid : 0,
        sortData,
        current
      )
    );
    window.scrollTo(0, 0);
  };

  return (
    <div>
      <div className={styles.setbtn}>
        <Button className={styles.filterbtn}>Filter</Button>
      </div>
      <Row justify="space-around" className={styles.mainLine}>
        <Col lg={8} xl={5} xxl={5} className={styles.sider}>
          <div>
            <div className={styles.main}>
              <div className={styles.clear}>
                <p className={styles.filter}>Filters</p>
                <p className={styles.clear2} onClick={() => handleClear()}>
                  Clear
                </p>
              </div>

              <Collapse
                style={{ padding: 5 }}
                defaultActiveKey={["1"]}
                accordion
              >
                <Panel header="Categories" key="1" style={{ padding: 0 }}>
                  <div className={styles.check}>
                    <div className={styles.checkname}>
                      {filterSideData?.categories?.map((item, index) => (
                        <Checkbox
                          onChange={(e) => onChange(e, item, "category")}
                          key={index}
                          className={styles.list}
                          checked={checkedItems.includes(item)}
                        >
                          {item.Category_Name}
                        </Checkbox>
                      ))}
                    </div>
                  </div>
                </Panel>

                <Panel
                  header="Brands & Collections"
                  key="1"
                  style={{ padding: 0 }}
                >
                  <div className={styles.check}>
                    <div className={styles.checkname}>
                      {filterSideData?.brand?.map((item, index) => (
                        <Checkbox
                          onChange={(e) => onChange(e, item, "brands")}
                          key={index}
                          className={styles.list}
                          checked={checkedItems.includes(item)}
                        >
                          {item}
                        </Checkbox>
                      ))}
                    </div>
                  </div>
                </Panel>

                <Panel header="Colors" key="2" style={{ padding: 0 }}>
                  <div className={styles.check}>
                    <div className={styles.checkname6}>
                      {filterSideData?.colors?.map((item, index) => (
                        <Checkbox
                          onChange={(e) => onChange(e, item, "color")}
                          key={index}
                          className={styles.list}
                          checked={checkedItems.includes(item)}
                        >
                          {item}
                        </Checkbox>
                      ))}
                    </div>
                  </div>
                </Panel>

                <Panel header="Rate" key="4" style={{ padding: 0 }}>
                  <div className={styles.check}>
                    <div className={styles.checkname3}>
                      {filterSideData?.rate?.map((item, index) => (
                        <Radio
                          onChange={(e) => onChange2(e, item, "rateWise")}
                          key={index}
                          className={styles.list}
                          checked={item === selectedRate}
                        >
                          {item}
                        </Radio>
                      ))}
                    </div>
                  </div>
                </Panel>
              </Collapse>
            </div>
          </div>
        </Col>
        <Col xs={22} md={22} lg={23} xl={15} xxl={15} className={styles.wear}>
          <div className={styles.new}>
            <p className={styles.home}>
              <Link style={{ color: "#000" }} to="/">
                Home
              </Link>{" "}
              &gt; {data?.item}
            </p>
          </div>
          <div className={styles.shop}>
            <p className={styles.show}></p>
            <Select
              className={styles.select}
              placeholder="Sort By Latest"
              style={{ width: "100%" }}
              onChange={(e) => handleChange(e, filterSideData?.sortBy, "sort")}
              tokenSeparators={[","]}
              options={filterDropdown(filterSideData?.sortBy)}
            />
          </div>
          <Col xs={24} md={24} lg={24} xl={24} xxl={24}>
            {loader ? (
              <Spin
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100vh",
                }}
                spinning={loader}
              />
            ) : filterProducct?.length > 0 ? (
              <>
                <Row justify="start">
                  {filterProducct?.map((item, index) => (
                    <Col
                      xs={12}
                      md={12}
                      lg={8}
                      xl={8}
                      xxl={8}
                      className={styles.setMain}
                    >
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
                          preview={false}
                          // style={{height:'500px',width:'100%'}}
                          src={item?.Product_Image}
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
              </>
            ) : (
              <>
                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                    fontSize: "20px",
                  }}
                >
                  NO DATA FOUND!
                </p>
              </>
            )}
          </Col>
          <ResponsivePagination
            current={currentPage}
            total={paginationData?.totalPages}
            onPageChange={onShowSizeChange}
            className={styles.pagination}
          />
        </Col>
      </Row>
    </div>
  );
}

export default Catagory;
