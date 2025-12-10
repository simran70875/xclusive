import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { TextField } from "@mui/material";

let url = process.env.REACT_APP_API_URL;

const ShowCoinsHistory = () => {
  const adminToken = localStorage.getItem("token");
  const [coinsData, setCoinsData] = useState([]);
  const [coinsAllData, setCoinsAllData] = useState([]);
  const coinsName = "";
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 100,
  });
  const [rowCount, setRowCount] = useState(0);

  const Navigate = useNavigate();

  const columns = [
    {
      field: "_id",
      width: 240,
      headerName: "Id",
    },
    {
      field: "User_Name",
      headerName: "User Name",
      width: 130,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "User_Mobile_No",
      headerName: "Mobile No",
      width: 130,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "Date",
      headerName: "Date",
      width: 130,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "Time",
      headerName: "Time",
      width: 120,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "Trans_Type",
      headerName: "Type",
      width: 80,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "Amount",
      headerName: "Coins",
      width: 100,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
      renderCell: (params) => (
        <div>
          {params?.row?.Trans_Type === "Credit" ? (
            <a style={{ color: "green" }}>+{params?.value}</a>
          ) : (
            <a style={{ color: "red" }}>-{params?.value}</a>
          )}
        </div>
      ),
    },
    {
      field: "Type",
      headerName: "Actions",
      width: 180,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "action",
      headerName: "Action",
      width: 60,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton
            aria-label="delete"
            onClick={() => handleCoinsDelete(params.row._id)}
          >
            <i className="fas fa-trash-alt font-size-16 font-Icon-Del"></i>
          </IconButton>
          {/* <IconButton
                        aria-label="update"
                        onClick={() => handleCoinsUpdate(params.row._id)}
                    >
                        <i className="fas fa-pencil-alt font-size-16 font-Icon-Up"></i>
                    </IconButton> */}
        </Stack>
      ),
      filterable: false,
      sortable: false,
      hide: false,
    },
  ];

  async function getCoins(page, pageSize) {
    try {
      setIsLoading(true);
      const res = await axios.get(`${url}/coins/history/get`, {
        params: {
          page: page + 1,
          pageSize,
        },
        headers: {
          Authorization: `${adminToken}`,
        },
      });
      setCoinsData(res?.data?.coins || []);
      setRowCount(res?.data?.total);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  }

  async function getAllCoins() {
    try {
      setIsLoading(true);
      const res = await axios.get(`${url}/coins/history/get`, {
        params: {
        },
        headers: {
          Authorization: `${adminToken}`,
        },
      });
      setCoinsAllData(res?.data?.coins || []);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getCoins(paginationModel.page, paginationModel.pageSize);
    getAllCoins();
  }, [adminToken, paginationModel.page, paginationModel.pageSize]);

  const handleCoinsDelete = (id) => {
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
          .delete(`${url}/coins/history/delete/${id}`, {
            headers: {
              Authorization: `${adminToken}`,
            },
          })
          .then(() => {
            getCoins(paginationModel.page, paginationModel.pageSize);
            getAllCoins();
            Swal.fire("Success!", "Coins has been deleted!", "success");
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "Coins has not been deleted!", "error");
          });
      }
    });
  };

  const handleMultipleCoinsDelete = () => {
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
          .delete(`${url}/coins/history/deletes`, {
            data: { ids: idsToDelete },
            headers: {
              Authorization: `${adminToken}`,
            },
          })
          .then(() => {
            getCoins(paginationModel.page, paginationModel.pageSize);
            getAllCoins();
            Swal.fire("Success!", "Coins has been deleted!", "success");
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "Coins has not been deleted!", "error");
          });
      }
    });
  };

  const handleFilter = () => {
    const filteredCoinsList = coinsAllData?.filter((coins) => {
      const formattedCoinsName = (coins?.name || "")
        .toUpperCase()
        .replace(/\s/g, "");
      let isCoinsName = true;
      if (coinsName) {
        isCoinsName = formattedCoinsName.includes(
          coinsName.toUpperCase().replace(/\s/g, "")
        );
      }

      return isCoinsName;
    });

    // Apply date filtering
    let filteredByDate = filteredCoinsList;
    if (startDateFilter || endDateFilter) {
      filteredByDate = filteredCoinsList?.filter((coins) => {
        let coinsDate = coins?.Date;
        const [day, month, year] = coinsDate?.split("/");
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
    const filteredData = filteredByDate.filter((coins) => {
      const formattedSearchQuery = searchQuery.toUpperCase().replace(/\s/g, "");
      const rowValues = Object.values(coins);
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

  const localeText = {
    noRowsLabel: "No Data Found 😔",
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
            <div className="col-2 table-heading">Coins History</div>
            <div className="d-flex flex-wrap gap-2 mt-2">
              <button
                onClick={() => Navigate("/addCoins")}
                className="btn btn-primary waves-effect waves-light"
              >
                Add Coins <i className="fas fa-arrow-right ms-2"></i>
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
              {/* <div className="card"> */}

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
              <a
                className="btn btn-danger waves-effect waves-light"
                style={{ margin: "12px" }}
                onClick={() => handleClearFilters()}
              >
                Clear Filters
              </a>

              <div className="datagrid-container">
                <DataGrid
                  style={{ textTransform: "capitalize" }}
                  rows={searchQuery === "" && startDateFilter === "" && endDateFilter ==="" ? coinsData : handleFilter()}
                  columns={columns}
                  checkboxSelection
                  disableSelectionOnClick
                  getRowId={getRowId}
                  localeText={localeText}
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
                  onCellClick={handleCellClick}
                  onRowSelectionModelChange={(e) => setSelectedRows(e)}
                  pagination
                  paginationMode={searchQuery === "" && startDateFilter === "" && endDateFilter ==="" ? "server" : "client"}
                  rowCount={searchQuery === "" && startDateFilter === "" && endDateFilter ==="" ? rowCount : handleFilter().length}
                  paginationModel={paginationModel}
                  onPaginationModelChange={(e) => setPaginationModel(e)}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 100 } },
                  }}
                  pageSizeOptions={[10, 25, 50, 100]}
                />
                {selectedRows.length > 0 && (
                  <div className="row-data">
                    <div>{selectedRows.length} Coins row selected</div>
                    <DeleteIcon
                      style={{ color: "red" }}
                      className="cursor-pointer"
                      onClick={() => handleMultipleCoinsDelete()}
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

export default ShowCoinsHistory;
