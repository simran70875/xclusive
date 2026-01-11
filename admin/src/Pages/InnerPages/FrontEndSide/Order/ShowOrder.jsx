import { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { editOrder } from "../../../../Redux/Actions/FronendActions/OrderActions";
import { useDispatch } from "react-redux";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

let url = process.env.REACT_APP_API_URL;

const ShowOrder = () => {
  const adminToken = localStorage.getItem("token");
  const dispatch = useDispatch();
  const [orderData, setOrderData] = useState([]);
  const [allOrderData, setAllOrderData] = useState([]);
  const orderName = "";
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 100,
  });
  const [rowCount, setRowCount] = useState(0);

  const localeText = { noRowsLabel: "No Data Found 😔" };

  const Navigate = useNavigate();

  const columns = [
    {
      field: "createdAt",
      width: 150,
      headerName: "Created At",
      renderCell: (params) => {
        return <>{new Date(params.row.createdAt).toLocaleString()}</>;
      },
    },
    {
      field: "orderId",
      width: 120,
      headerName: "Id",
    },
    {
      field: "userInfo",
      headerName: "Retailer Info",
      width: 200,
      renderCell: (params) => (
        <div
          style={{
            whiteSpace: "normal",
            lineHeight: "1.5",
            paddingTop: 10,
            paddingBottom: 10,
          }}
        >
          <strong>Name:</strong> {params.row.User_Name}
          <br />
          <strong>Mobile:</strong> {params.row.User_Mobile_No}
        </div>
      ),
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "paymentInfo",
      headerName: "Payment Info",
      width: 150,
      renderCell: (params) => (
        <div
          style={{
            whiteSpace: "normal",
            lineHeight: "1.5",
            paddingTop: 10,
            paddingBottom: 10,
          }}
        >
          <strong>Payment Status:</strong> {params.row.payment_status}
        </div>
      ),
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },

    {
      field: "Shipping_Charge",
      headerName: "Shipping Charges",
      width: 150,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
      renderCell: (params) => (
        <div>
          {params.row.Shipping_Charge
            ? `£${params.row.Shipping_Charge}`
            : "----"}
        </div>
      ),
    },

    {
      field: "FinalPrice",
      headerName: "Total Amount",
      width: 120,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
      renderCell: (params) => (
        <div>
          {params.row.FinalPrice
            ? `£${params.row.FinalPrice + params.row.CouponPrice}`
            : "----"}
        </div>
      ),
    },

    {
      field: "CouponPrice",
      headerName: "Coupon Amount",
      width: 120,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
      renderCell: (params) => (
        <div>{params.row.Coupon ? `£${params.row.CouponPrice}` : "----"}</div>
      ),
    },
    {
      field: "action",
      headerName: "Action",
      width: 130,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton
            aria-label="delete"
            onClick={() => handleOrderDelete(params.row._id)}
          >
            <i className="fas fa-trash-alt font-size-16 font-Icon-Del"></i>
          </IconButton>

          {params.row.OrderType === "Failed" ? (
            <IconButton
              aria-label="update"
              onClick={() => handleOrderUpdate(params.row._id)}
            >
              <i className="fas fa-eye font-size-16 font-Icon-Up"></i>
            </IconButton>
          ) : (
            <IconButton
              aria-label="update"
              onClick={() => handleOrderUpdate(params.row._id)}
            >
              <i className="fas fa-pencil-alt font-size-16 font-Icon-Up"></i>
            </IconButton>
          )}
        </Stack>
      ),
      filterable: false,
      sortable: false,
      hide: false,
    },
  ];

  useEffect(() => {
    async function getOrder(page, pageSize) {
      setIsLoading(true);
      try {
        const res = await axios.get(`${url}/order/get/all`, {
          params: { page: page + 1, pageSize },
          headers: {
            Authorization: `${adminToken}`,
          },
        });

        console.log("getOrder", res?.data);
        setOrderData(res?.data?.orderList || []);
        setRowCount(res?.data?.totalOrders);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    }

    async function getOrdersWithoutPAgination() {
      setIsLoading(true);
      try {
        const res = await axios.get(`${url}/order/get/all`, {
          headers: { Authorization: `${adminToken}` },
        });
        setAllOrderData(res?.data?.orderList || []);
        console.log("getOrder without pagination", res?.data?.orderList);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    }

    getOrder(paginationModel.page, paginationModel.pageSize);
    getOrdersWithoutPAgination();
  }, [
    adminToken,
    startDateFilter,
    endDateFilter,
    paginationModel.page,
    paginationModel.pageSize,
  ]);

  const handlePaginationChange = (newPaginationModel) => {
    setPaginationModel(newPaginationModel);
  };

  const handleOrderUpdate = (id) => {
    dispatch(editOrder(id));
    Navigate("/editOrders");
  };

  const handleOrderDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${url}/order/delete/${id}`, {
            headers: {
              Authorization: `${adminToken}`,
            },
          })
          .then(() => {
            setOrderData(orderData.filter((d) => d?._id !== id) || []);
            setAllOrderData(allOrderData.filter((d) => d?._id !== id) || []);
            Swal.fire("Success!", "Order has been deleted!", "success");
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "Order has not been deleted!", "error");
          });
      }
    });
  };

  const handleMultipleOrderDelete = () => {
    let idsToDelete = selectedRows;

    Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${url}/order/deletes`, {
            data: { ids: idsToDelete },
            headers: {
              Authorization: `${adminToken}`,
            },
          })
          .then(() => {
            setOrderData(
              orderData?.filter((d) => !idsToDelete?.includes(d?._id)) || []
            );
            Swal.fire("Success!", "Order has been deleted!", "success");
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "Order has not been deleted!", "error");
          });
      }
    });
  };

  const handleFilter = () => {
    const filteredOrderList = allOrderData?.filter((order) => {
      const formattedOrderName = (order?.name || "")
        .toUpperCase()
        .replace(/\s/g, "");

      let isOrderName = true;
      if (orderName)
        isOrderName = formattedOrderName.includes(
          orderName.toUpperCase().replace(/\s/g, "")
        );
      return isOrderName;
    });

    // Apply date filtering
    let filteredByDate = filteredOrderList;
    if (startDateFilter || endDateFilter) {
      filteredByDate = filteredOrderList?.filter((order) => {
        let orderDate = order?.Date;
        const [day, month, year] = orderDate?.split("/");
        const newDate = new Date(year, month - 1, day);
        newDate.setHours(0, 0, 0, 0);

        let isDateInRange = true;
        if (startDateFilter && endDateFilter) {
          const startDate = new Date(startDateFilter);
          startDate.setHours(0, 0, 0, 0);

          const endDate = new Date(endDateFilter);
          endDate.setHours(0, 0, 0, 0);

          isDateInRange = newDate >= startDate && newDate <= endDate;
        } else if (startDateFilter) {
          const startDate = new Date(startDateFilter);
          startDate.setHours(0, 0, 0, 0);
          isDateInRange = newDate >= startDate;
        } else if (endDateFilter) {
          const endDate = new Date(endDateFilter);
          endDate.setHours(0, 0, 0, 0);
          isDateInRange = newDate <= endDate;
        }
        return isDateInRange;
      });
    }

    // Apply order type filtering
    let filteredByOrderType = filteredByDate;
    if (orderTypeFilter) {
      filteredByOrderType = filteredByDate?.filter(
        (order) =>
          order?.OrderType?.toUpperCase() === orderTypeFilter.toUpperCase()
      );
    }

    // Apply search query filtering
    const filteredData = filteredByOrderType?.filter((order) => {
      const formattedSearchQuery = searchQuery.toUpperCase().replace(/\s/g, "");
      const rowValues = Object.values(order);
      for (let i = 0; i < rowValues.length; i++) {
        const formattedRowValue = String(rowValues[i])
          .toUpperCase()
          .replace(/\s/g, "");
        if (formattedRowValue.includes(formattedSearchQuery)) {
          return true;
        }
      }
      return false;
    });

    return filteredData;
  };

  const getRowId = (row) => row._id;
  const handleCellClick = (params, event) => {
    if (event.target.type !== "checkbox") {
      event.stopPropagation();
    }
  };

  const handleClearFilters = () => {
    setStartDateFilter("");
    setEndDateFilter("");
    setOrderTypeFilter("");
  };

  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-2 table-heading">Order List</div>
            <div className="searchContainer mb-3">
              <div className="searchBarcontainer">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="searchBar"
                />
                <ClearIcon
                  className="cancelSearch"
                  onClick={() => setSearchQuery("")}
                />
              </div>
            </div>
            <div className="col-12">
              <TextField
                label="Start Date"
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
                style={{ margin: "5px", width: "135px" }}
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
              />
              <TextField
                label="End Date"
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
                style={{ margin: "5px", width: "135px" }}
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
              />
              <FormControl
                style={{ margin: "2px", width: "135px" }}
                variant="outlined"
                className="dropdown"
              >
                <InputLabel>Order Type</InputLabel>
                <Select
                  value={orderTypeFilter}
                  onChange={(e) => setOrderTypeFilter(e.target.value)}
                  label="Order Type"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Delivered">Delivered</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Pick Up">Pick Up</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Returned">Returned</MenuItem>
                  <MenuItem value="Accepted">Accepted</MenuItem>
                </Select>
              </FormControl>

              <button
                className="btn btn-danger waves-effect waves-light"
                style={{ margin: "12px" }}
                onClick={() => handleClearFilters()}
              >
                Clear Filters
              </button>

              <div className="datagrid-container">
                <DataGrid
                  getRowHeight={() => "auto"}
                  style={{ textTransform: "capitalize", fontSize: 13 }}
                  rows={
                    searchQuery === "" &&
                    startDateFilter === "" &&
                    endDateFilter === ""
                      ? orderData
                      : handleFilter()
                  }
                  columns={columns}
                  checkboxSelection
                  disableSelectionOnClick
                  getRowId={getRowId}
                  filterPanelDefaultOpen
                  filterPanelPosition="top"
                  slots={{
                    toolbar: (props) => (
                      <div>
                        <GridToolbar />
                      </div>
                    ),
                  }}
                  loading={isLoading}
                  localeText={localeText}
                  onCellClick={handleCellClick}
                  onRowSelectionModelChange={(e) => setSelectedRows(e)}
                  pagination
                  paginationMode={
                    searchQuery === "" &&
                    startDateFilter === "" &&
                    endDateFilter === ""
                      ? "server"
                      : "client"
                  } // Use client pagination during search
                  rowCount={
                    searchQuery === "" &&
                    startDateFilter === "" &&
                    endDateFilter === ""
                      ? rowCount
                      : handleFilter().length
                  }
                  pageSizeOptions={[10, 25, 50, 100]}
                  paginationModel={paginationModel}
                  onPaginationModelChange={handlePaginationChange}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 100 } },
                  }}
                />

                {selectedRows.length > 0 && (
                  <div className="row-data">
                    <div>{selectedRows.length} Order selected</div>
                    <DeleteIcon
                      style={{ color: "red" }}
                      className="cursor-pointer"
                      onClick={() => handleMultipleOrderDelete()}
                    />
                  </div>
                )}
              </div>
              {/* </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowOrder;
