/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import Slider from "react-slick";
import React, { useEffect } from "react";
import { Col, Image, Rate, Row } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useDispatch, useSelector } from "react-redux";

import arroe from "../../../Assets/PNG/arroe.png";
import { getAllReviewApi } from "../../../Features/Setting/Setting";

import styles from "./index.module.scss";

function CustomerReview() {
  const dispatch = useDispatch();
  const reviewAllData = useSelector((state) => state.setting?.allReviewData);

  useEffect(() => {
    dispatch(getAllReviewApi());
  }, []);

  const settings = {
    // dots: true,
    infinite: true,
    speed: 2500,
    slidesToShow: 1.5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 100,
    responsive: [
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: 1.5,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1.2,
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

  return (
    <div>
      <Row justify="center" className={styles.maining}>
        <Col xs={22} md={22} lg={22} xl={22} xxl={22} className={styles.main}>
          <Row className={styles.main2}>
            <Col
              xs={22}
              md={22}
              lg={22}
              xl={5}
              xxl={5}
              className={styles.main3}
            >
              <div className={styles.customer}>
                <p className={styles.testimonial}>Customer Testimonial</p>
                {/* <p className={styles.point}>
                  The point of using Lorem Ipsum is that it has a more-or-less
                  normal distribution of letters, as opposed to using 'Content
                  here, content here', making it look like readable English.
                </p> */}
              </div>
            </Col>

            <Col
              xs={22}
              md={22}
              lg={22}
              xl={22}
              xxl={22}
              className={styles.slidermain}
            >
              {reviewAllData?.length > 0 ? (
                <>
                  <Slider {...settings} className={styles.slike}>
                    {reviewAllData?.map((item, index) => (
                      <>
                        <div className={styles.sets} key={index}>
                          <div className={styles.first}>
                            <div className={styles.second}>
                              <Image preview={false}
                                src={item?.User_Image}
                                alt=" "
                                className={styles.reviewImg}
                                
                              />
                              <div className={styles.set}>
                                <Image preview={false}
                                  src={arroe}
                                  alt=" "
                                  className={styles.reviewImg2}
                                  
                                />
                                <TextArea
                                  disabled
                                  defaultValue={item?.comment}
                                />
                                {/* <p className={styles.writeReview}>
                              {item?.comment}
                            </p> */}
                                <div className={styles.setName}>
                                  <p className={styles.dataName}>
                                    {item?.User_Name}
                                  </p>
                                  <Rate
                                    className={styles.ratingset}
                                    disabled
                                    defaultValue={item?.rating}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ))}
                  </Slider>
                </>
              ) : (
                <>
                  <p
                    style={{
                      fontSize: "20px",
                      textAlign: "center",
                    }}
                  >
                    No Review Found!
                  </p>
                </>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default CustomerReview;
