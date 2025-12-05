import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { editCoupon } from "../../../../Redux/Actions/FronendActions/CouponActions";
import { useDispatch } from "react-redux";
import { TextField } from "@mui/material";

let url = process.env.REACT_APP_API_URL;

const ShowCoupon = () => {
  const adminToken = localStorage.getItem("token");

  const [couponData, setCouponData] = useState([]);
  const [couponAllData, setAllCouponData] = useState([]);
  const couponName = "";
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [paginationModel, setPaginationModel] = useState({page: 0,pageSize: 100,});
  const [rowCount, setRowCount] = useState(0);

  const Navigate = useNavigate();
  const dispatch = useDispatch();

  const localeText = {
    noRowsLabel: "No Data Found 😔",
  };

  const columns = [
    {
      field: "_id",
      width: 240,
      headerName: "Id",
    },
    {
      field: "couponCode",
      headerName: "Coupon Name",
      width: 140,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 140,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
      renderCell: (params) => (params.row.createdAt ? new Date(params.row.createdAt).toLocaleDateString() : ""),
    },
    {
      field: "createdBy",
      headerName: "Creation",
      width: 120,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "discountAmount",
      headerName: "Discount Amount",
      width: 120,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "coinsReward",
      headerName: "Coins Reward",
      width: 120,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "creationDate",
      headerName: "Start Date",
      width: 120,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "expiryDate",
      headerName: "End Date",
      width: 120,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "usageLimits",
      headerName: "Limits",
      width: 90,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <div className="form-check form-switch">
          <input
            type="checkbox"
            className="form-check-input"
            id={`customSwitch-${params.id}`}
            onChange={() => handleCouponStatus(params.row, !params.value)}
            checked={params.value}
            onClick={(event) => event.stopPropagation()}
          />
          <label
            className="form-check-label"
            htmlFor={`customSwitch-${params.id}`}
            style={{ color: params.value ? "green" : "grey" }}
          >
            {params.value ? "Enable" : "Disable"}
          </label>
        </div>
      ),
      filterable: false,
      sortable: true,
      hide: false,
    },
    {
      field: "action",
      headerName: "Action",
      width: 90,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton
            aria-label="delete"
            onClick={() => handleCouponDelete(params.row._id)}
          >
            <i className="fas fa-trash-alt font-size-16 font-Icon-Del"></i>
          </IconButton>
          <IconButton
            aria-label="update"
            onClick={() => handleCouponUpdate(params.row._id)}
          >
            <i className="fas fa-pencil-alt font-size-16 font-Icon-Up"></i>
          </IconButton>
        </Stack>
      ),
      filterable: false,
      sortable: false,
      hide: false,
    },
  ];


  async function getCoupon(page,pageSize) {
    setIsLoading(true);
    try {
      const res = await axios.get(`${url}/coupon/get`, {
        params: { page: page+1, pageSize },
        headers: {
          Authorization: `${adminToken}`,
        },
      });
      setCouponData(res?.data?.coupon || []);
      setRowCount(res?.data?.total);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  }
  async function getCouponWithoutPagination() {
    setIsLoading(true);
    try {
      const res = await axios.get(`${url}/coupon/get`, {
        params: {},
        headers: {Authorization: `${adminToken}`},
      });
      setAllCouponData(res?.data?.coupon || []);
      console.log("all coupon data ",res?.data?.coupon);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  }

  useEffect(() => {
  
    getCoupon(paginationModel.page, paginationModel.pageSize);
    getCouponWithoutPagination();
  }, [adminToken,paginationModel.page, paginationModel.pageSize]);

  const handleCouponUpdate = (coupon) => {
    dispatch(editCoupon(coupon));
    Navigate("/editCoupon");
  };

  const handleCouponDelete = (id) => {
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
          .delete(`${url}/coupon/delete/${id}`, {
            headers: {
              Authorization: `${adminToken}`,
            },
          })
          .then(() => {
            getCoupon(paginationModel.page, paginationModel.pageSize);
            getCouponWithoutPagination();
            Swal.fire("Success!", "Coupon has been deleted!", "success");
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "Coupon has not been deleted!", "error");
          });
      }
    });
  };

  const handleMultipleCouponDelete = () => {
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
          .delete(`${url}/coupon/deletes`, {
            data: { ids: idsToDelete },
            headers: {
              Authorization: `${adminToken}`,
            },
          })
          .then(() => {
            getCoupon(paginationModel.page, paginationModel.pageSize);
            getCouponWithoutPagination();
            Swal.fire("Success!", "Coupon has been deleted!", "success");
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "Coupon has not been deleted!", "error");
          });
      }
    });
  };

  const handleCouponStatus = async (coupon, newStatus) => {
    try {
      await axios.patch(
        `${url}/coupon/update/status/${coupon?._id}`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `${adminToken}`,
          },
        }
      );

      setCouponData(couponData.map((c) =>c._id === coupon._id ? { ...c, status: newStatus } : c) || []);
      setAllCouponData(couponAllData.map((c) =>c._id === coupon._id ? { ...c, status: newStatus } : c) || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFilter = () => {
    const filteredCouponList = couponAllData?.filter((coupon) => {
      const formattedCouponName = (coupon?.name || "").toUpperCase().replace(/\s/g, "");
      let isCouponName = true;
      if (couponName) isCouponName = formattedCouponName.includes(couponName.toUpperCase().replace(/\s/g, ""));
      return isCouponName;
    });

    // Apply date filtering
    let filteredByDate = filteredCouponList;
    
    if (startDateFilter || endDateFilter) {
      filteredByDate = filteredCouponList?.filter((coupon) => {
        let couponDate = coupon?.creationDate;
        const [day, month, year] = couponDate?.split("/");
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

    // Apply search query filtering
    const filteredData = filteredByDate?.filter((coupon) => {
      const formattedSearchQuery = searchQuery.toUpperCase().replace(/\s/g, "");
      const rowValues = Object.values(coupon);
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
  };

  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-2 table-heading">Coupon List</div>
            <div className="d-flex flex-wrap gap-2 mt-2">
              <button
                onClick={() => Navigate("/addCoupon")}
                className="btn btn-primary waves-effect waves-light"
              >
                Add Coupon <i className="fas fa-arrow-right ms-2"></i>
              </button>
            </div>
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
              <button
                className="btn btn-danger waves-effect waves-light"
                style={{ margin: "12px" }}
                onClick={() => handleClearFilters()}
              >
                Clear Filters
              </button>

              <div className="datagrid-container">
                <DataGrid
                  style={{ textTransform: "capitalize" }}
                  rows={searchQuery === "" && startDateFilter === "" && endDateFilter === "" ? couponData : handleFilter()}
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
                  localeText={localeText}
                  loading={isLoading}
                  onCellClick={handleCellClick}
                  onRowSelectionModelChange={(e) => setSelectedRows(e)}
                  
                  pagination
                  paginationMode={searchQuery === "" && startDateFilter === "" && endDateFilter === "" ? "server" : "client"} // Use client pagination during search
                  rowCount={searchQuery === "" && startDateFilter === "" && endDateFilter === "" ? rowCount : handleFilter().length}
                  paginationModel={paginationModel}
                  onPaginationModelChange={(e) => setPaginationModel(e)}
                  initialState={{pagination: { paginationModel: { pageSize: 100 } }}}
                  pageSizeOptions={[10, 25, 50, 100]}
                />
                {selectedRows.length > 0 && (
                  <div className="row-data">
                    <div>{selectedRows.length} Coupon selected</div>
                    <DeleteIcon
                      style={{ color: "red" }}
                      className="cursor-pointer"
                      onClick={() => handleMultipleCouponDelete()}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowCoupon;
