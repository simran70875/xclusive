import axios from "axios";
import { useEffect, useState } from "react";
import pendingImage from "../../../src/resources/assets/images/pending_order.png";
import totalImage from "../../../src/resources/assets/images/total.png";
import retunImage from "../../../src/resources/assets/images/return.png";
import completeImage from "../../../src/resources/assets/images/Complete order.png";
import confirmedImage from "../../../src/resources/assets/images/confirmed order.png";
import rejectImage from "../../../src/resources/assets/images/reject_order.png";
import pickupImage from "../../../src/resources/assets/images/pickup.png";
import totalOrderImage from "../../../src/resources/assets/images/total order.png";

let url = process.env.REACT_APP_API_URL;

const DashBoard = () => {
  const [orderData, setOrderData] = useState([]);

  useEffect(() => {
    async function fetchOrderData() {
      try {
        const adminToken = localStorage.getItem("token");
        const res = await axios.post(
          `${url}/order/get/byStatus/forAdmin`,
          {
            startDate: "",
            endDate: "",
          },
          {
            headers: {
              Authorization: `${adminToken}`,
            },
          }
        );
        setOrderData(res.data || []);
      } catch (error) {
        console.log(error);
      }
    }

    fetchOrderData();
  }, []);

  return (
    <>
      <div className="main-content dark">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-2 table-heading">DashBoard</div>
              <div className="col-12 mt-2">
                <div className="mt-4">
                  <div className="card-body">
                    <div className="row mt-2">
                      <div className="col-md-6 col-xl-3">
                        <div className="card">
                          <div className="card-body">
                            <div className="float-end mt-2">
                              <div
                                id="total-revenue-chart"
                                data-colors='["--bs-primary"]'
                              >
                                <img src={totalImage} height={50} width={50} />
                              </div>
                            </div>
                            <div>
                              <h4 className="mb-1 mt-1">
                                £
                                <span data-plugin="counterup">
                                  {orderData?.totalOrderAmount}
                                </span>
                              </h4>
                              <p className="text-muted mb-0">
                                Total Order Revenue
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6 col-xl-3">
                        <div className="card">
                          <div className="card-body">
                            <div className="float-end mt-2">
                              <div
                                id="total-revenue-chart"
                                data-colors='["--bs-primary"]'
                              >
                                <img src={totalImage} height={50} width={50} />
                              </div>
                            </div>
                            <div>
                              <h4 className="mb-1 mt-1">
                                £
                                <span data-plugin="counterup">
                                  {orderData?.totalDeliveredAmount}
                                </span>
                              </h4>
                              <p className="text-muted mb-0">
                                Completed Order Revenue
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6 col-xl-3">
                        <div className="card">
                          <div className="card-body">
                            <div className="float-end mt-2">
                              <div
                                id="orders-chart"
                                data-colors='["--bs-success"]'
                              >
                                <img
                                  src={totalOrderImage}
                                  height={50}
                                  width={50}
                                />
                              </div>
                            </div>
                            <div>
                              <h4 className="mb-1 mt-1">
                                <span data-plugin="counterup">
                                  {orderData?.totalOrders}
                                </span>
                              </h4>
                              <p className="text-muted mb-0">Total Orders</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6 col-xl-3">
                        <div className="card">
                          <div className="card-body">
                            <div className="float-end mt-2">
                              <div
                                id="customers-chart"
                                data-colors='["--bs-primary"]'
                              >
                                <img
                                  src={completeImage}
                                  height={50}
                                  width={50}
                                />
                              </div>
                            </div>
                            <div>
                              <h4
                                style={{ color: "green" }}
                                className="mb-1 mt-1"
                              >
                                <span data-plugin="counterup">
                                  {orderData?.deliveredOrders}
                                </span>
                              </h4>
                              <p className="text-muted mb-0">
                                Completed Orders
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6 col-xl-3">
                        <div className="card">
                          <div className="card-body">
                            <div className="float-end mt-2">
                              <div
                                id="growth-chart"
                                data-colors='["--bs-warning"]'
                              >
                                <img
                                  src={pendingImage}
                                  height={50}
                                  width={50}
                                />
                              </div>
                            </div>
                            <div>
                              <h4 className="mb-1 mt-1">
                                <span data-plugin="counterup">
                                  {orderData?.pendingOrders}
                                </span>
                              </h4>
                              <p className="text-muted mb-0">Pending Orders</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6 col-xl-3">
                        <div className="card">
                          <div className="card-body">
                            <div className="float-end mt-2">
                              <div
                                id="growth-chart"
                                data-colors='["--bs-warning"]'
                              >
                                <img
                                  src={confirmedImage}
                                  height={50}
                                  width={50}
                                />
                              </div>
                            </div>
                            <div>
                              <h4 className="mb-1 mt-1">
                                <span data-plugin="counterup">
                                  {orderData?.acceptedOrders}
                                </span>
                              </h4>
                              <p className="text-muted mb-0">Accepted Orders</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6 col-xl-3">
                        <div className="card">
                          <div className="card-body">
                            <div className="float-end mt-2">
                              <div
                                id="growth-chart"
                                data-colors='["--bs-warning"]'
                              >
                                <img src={pickupImage} height={50} width={50} />
                              </div>
                            </div>
                            <div>
                              <h4 className="mb-1 mt-1">
                                <span data-plugin="counterup">
                                  {orderData?.pickupOrders}
                                </span>
                              </h4>
                              <p className="text-muted mb-0">Pick Up Orders</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6 col-xl-3">
                        <div className="card">
                          <div className="card-body">
                            <div className="float-end mt-2">
                              <div
                                id="growth-chart"
                                data-colors='["--bs-warning"]'
                              >
                                <img src={rejectImage} height={50} width={50} />
                              </div>
                            </div>
                            <div>
                              <h4 className="mb-1 mt-1">
                                <span data-plugin="counterup">
                                  {orderData?.rejectedOrders}
                                </span>
                              </h4>
                              <p className="text-muted mb-0">Rejected Orders</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6 col-xl-3">
                        <div className="card">
                          <div className="card-body">
                            <div className="float-end mt-2">
                              <div
                                id="growth-chart"
                                data-colors='["--bs-warning"]'
                              >
                                <img src={retunImage} height={50} width={50} />
                              </div>
                            </div>
                            <div>
                              <h4 className="mb-1 mt-1">
                                <span data-plugin="counterup">
                                  {orderData?.returnedOrders}
                                </span>
                              </h4>
                              <p className="text-muted mb-0">Return Orders</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6 col-xl-3">
                        <div className="card">
                          <div className="card-body">
                            <div className="float-end mt-2">
                              <div
                                id="total-revenue-chart"
                                data-colors='["--bs-primary"]'
                              >
                                <img src={retunImage} height={50} width={50} />
                              </div>
                            </div>
                            <div>
                              <h4 className="mb-1 mt-1">
                                {orderData?.cancelledOrders}
                              </h4>
                              <p className="text-muted mb-0">
                                Cancelled Orders
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-xl-3">
                        <div className="card">
                          <div className="card-body">
                            <div className="float-end mt-2">
                              <div
                                id="customers-chart"
                                data-colors='["--bs-primary"]'
                              >
                                <img
                                  src={completeImage}
                                  height={50}
                                  width={50}
                                />
                              </div>
                            </div>
                            <div>
                              <h4
                                style={{ color: "red" }}
                                className="mb-1 mt-1"
                              >
                                <span data-plugin="counterup">
                                  {orderData?.failedOrders}
                                </span>
                              </h4>
                              <p className="text-muted mb-0">Failed Orders</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashBoard;
