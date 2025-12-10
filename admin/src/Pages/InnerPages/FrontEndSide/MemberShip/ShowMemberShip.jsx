import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { editMemberShip } from "../../../../Redux/Actions/BackendActions/MemberShipActions";
import { useDispatch } from "react-redux";
import { TextField } from "@mui/material";

let url = process.env.REACT_APP_API_URL;

const ShowMemberShip = () => {
  const adminToken = localStorage.getItem("token");
  const dispatch = useDispatch();
  const [memberShipData, setMemberShipData] = useState([]);
  const [memberShipName, setMemberShipName] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const Navigate = useNavigate();

  const localeText = {
    noRowsLabel: "No Data Found 😔",
  };

  const columns = [
    {
      field: "_id",
      width: 320,
      headerName: "Id",
    },
    {
      field: "User_Name",
      headerName: "User Name",
      width: 165,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "User_Mobile_No",
      headerName: "Mobile No",
      width: 165,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "updatedAt",
      headerName: "Date",
      width: 165,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "total_membership",
      headerName: "Total  Membership",
      width: 165,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "action",
      headerName: "Action",
      width: 90,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton
            aria-label="delete"
            onClick={() => handleMemberShipDelete(params.row._id)}
          >
            <i className="fas fa-trash-alt font-size-16 font-Icon-Del"></i>
          </IconButton>
          {/* <IconButton
                        aria-label="update"
                        onClick={() => handleMemberShipUpdate(params.row._id)}
                    >
                        <i className="fas fa-pencil-alt font-size-16 font-Icon-Up"></i>
                    </IconButton> */}
        </Stack>
      ),
      filterable: false,
      sortable: false,
      hide: false,
    },
    {
      field: "View",
      headerName: "View",
      width: 90,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton onClick={() => handleMemberShipView(params.row)}>
            <i className="fas fa-eye font-Icon-view" />
          </IconButton>
        </Stack>
      ),
      filterable: false,
      sortable: false,
      hide: false,
    },
  ];

  useEffect(() => {
    async function getMemberShip() {
      try {
        const res = await axios.get(`${url}/memberShip/history/get/all`, {
          headers: {
            Authorization: `${adminToken}`,
          },
        });
        setMemberShipData(res?.data?.memberShipHistory || []);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    }
    getMemberShip();
  }, [endDateFilter, startDateFilter]);

  const handleMemberShipDelete = (id) => {
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
          .delete(`${url}/memberShip/delete/${id}`, {
            headers: {
              Authorization: `${adminToken}`,
            },
          })
          .then(() => {
            setMemberShipData(
              memberShipData.filter((d) => d?._id !== id) || []
            );
            Swal.fire("Success!", "MemberShip has been deleted!", "success");
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "MemberShip has not been deleted!", "error");
          });
      }
    });
  };

  const handleMultipleMemberShipDelete = () => {
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
          .delete(`${url}/memberShip/deletes`, {
            data: { ids: idsToDelete },
            headers: {
              Authorization: `${adminToken}`,
            },
          })
          .then(() => {
            setMemberShipData(
              memberShipData?.filter((d) => !idsToDelete?.includes(d?._id)) ||
                []
            );
            Swal.fire("Success!", "MemberShip has been deleted!", "success");
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "MemberShip has not been deleted!", "error");
          });
      }
    });
  };

  const handleMemberShipView = (memberShip) => {
    dispatch(editMemberShip(memberShip));
    Navigate("/showAllMemberShipOfUser");
  };

  const handleFilter = () => {
    const filteredMemberShipList = memberShipData?.filter((memberShip) => {
      const formattedMemberShipName = (memberShip?.name || "")
        .toUpperCase()
        .replace(/\s/g, "");
      let isMemberShipName = true;
      if (memberShipName) {
        isMemberShipName = formattedMemberShipName.includes(
          memberShipName.toUpperCase().replace(/\s/g, "")
        );
      }

      return isMemberShipName;
    });

    // Apply date filtering
    let filteredByDate = filteredMemberShipList;
    if (startDateFilter || endDateFilter) {
      filteredByDate = filteredMemberShipList?.filter((memberShip) => {
        let memberShipDate = memberShip?.updatedAt;
        const [day, month, year] = memberShipDate?.split("-");
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
    const filteredData = filteredByDate.filter((memberShip) => {
      const formattedSearchQuery = searchQuery.toUpperCase().replace(/\s/g, "");
      const rowValues = Object.values(memberShip);
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
            <div className="col-2 table-heading">MemberShip List</div>
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
                    <div>{selectedRows.length} MemberShip selected</div>
                    <DeleteIcon
                      style={{ color: "red" }}
                      className="cursor-pointer"
                      onClick={() => handleMultipleMemberShipDelete()}
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

export default ShowMemberShip;
