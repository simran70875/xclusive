/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { useEffect } from "react";
import { Button, Col, Row, Table } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { routes } from "../../Routes/Routes";
import { getAllOrderApi } from "../../Features/Order/Order";

import styles from "./index.module.scss";

function OrderPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userToken = useSelector((state) => state.user?.token);
  const orderData = useSelector((state) => state.order?.allOrderData);
  console.log("orderData ==>", orderData);
  const loader = useSelector((state) => state.order?.isOrderLoading);

  useEffect(() => {
    dispatch(getAllOrderApi(userToken));
    window.scrollTo(0, 0);
  }, [userToken]);

  const order2 = (record) => {
    console.log("records ==>", record);
    navigate(routes.orderviewUrl, {
        state: record,
    });
  };

  const getOrderStatusLabel = (orderType) => {
    switch (orderType) {
      case "1":
        return "Pending";
      case "2":
        return "Accepted";
      case "3":
        return "Pick Up";
      case "4":
        return "Rejected";
      case "5":
        return "Delivered";
      case "6":
        return "Cancelled";
      case "7":
        return "Returned";
      default:
        return "Cancelled";
    }
  };

  const paymentTypeStatus = (paymentStatus) => {
    // console.log(paymentStatus);
    switch (paymentStatus) {
      case "0":
        return "Wallet";
      case "1":
        return "Online";
      case "2":
        return "Cash On Delivery";
      default:
        return "-";
    }
  };

  const columns = [
    {
      title: "Order Id",
      dataIndex: "orderId",
      key: "orderId",
      width: "200px",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "200px",
      render: (text, record) => {
        // Assuming record.createdAt is a string in the format "YYYY-MM-DD"
        const dateParts = record.createdAt.split("-");
        const formattedDate = new Date(
          dateParts[0],
          dateParts[1] - 1,
          dateParts[2]
        ).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        return formattedDate;
      },
    },
    {
      title: "Amount",
      dataIndex: "FinalPrice",
      key: "FinalPrice",
      width: "200px",
      render: (text, record) => {
        const formattedAmount = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(record.FinalPrice);
        return formattedAmount;
      },
    },
    {
      title: "Payment Type",
      dataIndex: "PaymentType",
      key: "PaymentType",
      width: "200px",
      render: (text, record) => {
        const paymentStatus = paymentTypeStatus(record?.PaymentType);
        return paymentStatus;
      },
    },
    {
      title: "Order Status",
      dataIndex: "OrderType",
      key: "OrderType",
      width: "200px",
      render: (text, record) => {
        const orderStatus = getOrderStatusLabel(record?.OrderType);
        const statusColor =
          orderStatus === "Pending"
            ? "#FCB711"
            : orderStatus === "Accepted"
            ? "#0089D0"
            : orderStatus === "Pick Up"
            ? "#F37021"
            : orderStatus === "Rejected"
            ? "#CC004C"
            : orderStatus === "Delivered"
            ? "#0DB14B"
            : orderStatus === "Cancelled"
            ? "#6460AA"
            : orderStatus === "Returned"
            ? "#827b00"
            : "black";

        return <span style={{ color: statusColor }}>{orderStatus}</span>;
      },
    },
    {
      title: "",
      dataIndex: "view",
      key: "view",
      width: "200px",
      render: (text, record) => (
        <Button
          onClick={() => order2(record)}
          loading={loader}
          style={{
            borderRadius: "0px",
            color: "white",
            background: "#AB8000",
            width: "100%",
            height: "40px",
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Row justify="center" className={styles.mainLine}>
        <Col xs={22} md={22} lg={22} xl={18} xxl={18} className={styles.main}>
          <Row justify="center">
            <Col xs={22} md={22} lg={22} xl={22} xxl={22}>
              <div className={styles.mainfix}>
                <p className={styles.order}>Order History</p>
                <div className={styles.history}>
                  <Col
                    xs={24}
                    md={24}
                    lg={24}
                    xl={24}
                    xxl={24}
                    className={styles.tableContainer}
                  >
                    <Table
                      className={styles.ordertable}
                      dataSource={orderData}
                      columns={columns}
                      pagination={false}
                      // onRow={(record) => ({
                      //   onClick: () => order2(record),
                      // })}
                    />
                  </Col>
                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default OrderPage;
