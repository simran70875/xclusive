/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from "react";
import moment from "moment/moment";
import React, { useEffect } from "react";
import { Col, Image, Rate, Row } from "antd";

import styles from "./index.module.scss";

function Review(productReview) {
  const [data, setData] = useState();

  useEffect(() => {
    setData(productReview?.productReview);
  }, []);

  return (
    <div>
      <Row justify="center">
        {data?.length > 0 ? (
          <Col xs={24} md={24} lg={24} xl={24} xxl={24} className={styles.main}>
            {data?.map((data, index) => (
              <>
                <div className={styles.setreview} key={index}>
                  <div className={styles.review1}>
                    <Image
                      src={data?.User_Image}
                      alt="User_Image"
                      className={styles.blank}
                      preview={false}
                    />
                    <div>
                      <p>{data?.User_Name}</p>
                      <Rate disabled defaultValue={data?.rating} />
                    </div>
                  </div>
                  <div className={styles.date}>
                    <p>{moment(data?.createdAt).format("ll")}</p>
                  </div>
                </div>
                <p className={styles.reviewgraph}>{data?.comment}</p>
                <div className={styles.line}></div>
              </>
            ))}
          </Col>
        ) : (
          <>
            <p
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                // height: "100vh",
                fontSize: "20px",
              }}
            >
              NO DATA FOUND!
            </p>
            <div className={styles.line}></div>
          </>
        )}
      </Row>
    </div>
  );
}

export default Review;
