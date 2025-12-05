import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import Swal from "sweetalert2";
import {
  TextField,
} from "@mui/material";

let url = process.env.REACT_APP_API_URL;

const ShowReview = () => {
  const adminToken = localStorage.getItem("token");

  const [reviewData, setReviewData] = useState([]);
  // const [reviewName, setReviewName] = useState("");
  const reviewName = "";
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const localeText = {
    noRowsLabel: "No Data Found 😔",
  };

  const columns = [
    {
      field: "_id",
      width: 220,
      headerName: "Id",
    },
    {
      field: "User_Name",
      headerName: "Name",
      width: 130,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "User_Mobile_No",
      headerName: "Mobile No",
      width: 115,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "rating",
      headerName: "Rating",
      width: 130,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
      renderCell: (params) => (
        <span>{renderStarRating(params.row.rating)}</span>
      ),
    },
    {
      field: "text",
      headerName: "Text",
      width: 100,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "comment",
      headerName: "Comment",
      width: 100,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "createdAt",
      headerName: "Date",
      width: 130,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "Time",
      headerName: "Time",
      width: 130,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "status",
      headerName: "Feature",
      width: 120,
      renderCell: (params) => (
        <div className="form-check form-switch">
          <input
            type="checkbox"
            className="form-check-input"
            id={`customSwitch-${params.id}`}
            onChange={() => handleReviewStatus(params.row, !params.value)}
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
      width: 80,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton
            aria-label="delete"
            onClick={() => handleReviewDelete(params.row._id)}
          >
            <i className="fas fa-trash-alt font-size-16 font-Icon-Del"></i>
          </IconButton>
        </Stack>
      ),
      filterable: false,
      sortable: false,
      hide: false,
    },
  ];

  useEffect(() => {
    async function getReview() {
      try {
        const res = await axios.get(`${url}/review/get/all`, {
          headers: {
            Authorization: `${adminToken}`,
          },
        });
        setReviewData(res?.data?.reviews || []);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    }
    getReview();
  }, [adminToken]);

  // Helper function to generate star icons based on rating
  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      // stars.push(<span key={i} className="star-icon" style={{ color: "gold" }}>★</span>);
      stars.push(
        <span key={i} className="star-icon" style={{ color: "gold" }}>
          <i class="fas fa-star" aria-hidden="true"></i>
        </span>
      );
    }

    if (halfStar) {
      // stars.push(<span key={fullStars} className="star-icon">½★</span>);
      stars.push(
        <span key={fullStars} className="star-icon" style={{ color: "gold" }}>
          <i class="fas fa-star-half" aria-hidden="true"></i>
        </span>
      );
    }

    return stars;
  };

  const handleReviewDelete = (id) => {
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
          .delete(`${url}/review/delete/${id}`, {
            headers: {
              Authorization: `${adminToken}`,
            },
          })
          .then(() => {
            setReviewData(reviewData.filter((d) => d?._id !== id) || []);
            Swal.fire("Success!", "Review has been deleted!", "success");
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "Review has not been deleted!", "error");
          });
      }
    });
  };

  const handleMultipleReviewDelete = () => {
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
          .delete(`${url}/review/deletes`, {
            data: { ids: idsToDelete },
            headers: {
              Authorization: `${adminToken}`,
            },
          })
          .then(() => {
            setReviewData(
              reviewData?.filter((d) => !idsToDelete?.includes(d?._id)) || []
            );
            Swal.fire("Success!", "Review has been deleted!", "success");
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "Review has not been deleted!", "error");
          });
      }
    });
  };

  const handleReviewStatus = async (review, newStatus) => {
    try {
      await axios.patch(`${url}/review/update/status/${review?._id}`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `${adminToken}`,
          },
        }
      );

      const updatedReviewData = reviewData.map((c) =>
        c._id === review._id ? { ...c, status: newStatus } : c
      );
      setReviewData(updatedReviewData || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFilter = () => {
    const filteredReviewList = reviewData?.filter((review) => {
      const formattedReviewName = (review?.name || "")
        .toUpperCase()
        .replace(/\s/g, "");
      let isReviewName = true;
      if (reviewName) {
        isReviewName = formattedReviewName.includes(
          reviewName.toUpperCase().replace(/\s/g, "")
        );
      }

      return isReviewName;
    });

    // Apply date filtering
    let filteredByDate = filteredReviewList;
    if (startDateFilter || endDateFilter) {
      filteredByDate = filteredReviewList?.filter((review) => {
        let reviewDate = review?.createdAt;
        const [day, month, year] = reviewDate?.split("/");
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
    const filteredData = filteredByDate?.filter((review) => {
      const formattedSearchQuery = searchQuery.toUpperCase().replace(/\s/g, "");
      const rowValues = Object.values(review);
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
            <div className="col-2 table-heading">Review List</div>
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
                  rows={handleFilter()}
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
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                  }}
                  pageSizeOptions={[10, 25, 50, 100]}
                />
                {selectedRows.length > 0 && (
                  <div className="row-data">
                    <div>{selectedRows.length} Review selected</div>
                    <DeleteIcon
                      style={{ color: "red" }}
                      className="cursor-pointer"
                      onClick={() => handleMultipleReviewDelete()}
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

export default ShowReview;
