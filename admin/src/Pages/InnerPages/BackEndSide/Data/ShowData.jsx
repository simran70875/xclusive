import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { editData } from "../../../../Redux/Actions/BackendActions/DataActions";

let url = process.env.REACT_APP_API_URL;

const ShowData = () => {
  const adminToken = localStorage.getItem("token");

  const [data, setData] = useState([]);
  const [dataName, setDataName] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const Navigate = useNavigate();
  const dispatch = useDispatch();

  const localeText = {
    noRowsLabel: "No Data Found 😔",
  };

  const columns = [
    {
      field: "_id",
      width: 325,
      headerName: "Id",
    },
    {
      field: "Data_Type",
      headerName: "Type",
      width: 220,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "Data_Name",
      headerName: "Specification Name",
      width: 220,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "productsCount",
      headerName: "Total Products",
      width: 220,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "Data_Status",
      headerName: "Status",
      width: 220,
      renderCell: (params) => (
        <div className="form-check form-switch">
          <input
            type="checkbox"
            className="form-check-input"
            id={`customSwitch-${params.id}`}
            onChange={() => handleDataStatus(params.row, !params.value)}
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
      width: 180,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton
            aria-label="delete"
            onClick={() => handleDataDelete(params.row._id)}
          >
            <i className="fas fa-trash-alt font-size-16 font-Icon-Del"></i>
          </IconButton>
          <IconButton
            aria-label="edit"
            onClick={() => handleDataUpdate(params.row)}
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

  useEffect(() => {
    async function getData() {
      try {
        const res = await axios.get(`${url}/data/get`, {
          headers: {
            Authorization: `${adminToken}`,
          },
        });
        setData(res?.data?.data || []);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    }
    getData();
  }, []);

  const handleDataDelete = (id) => {
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
          .delete(`${url}/data/delete/${id}`, {
            headers: {
              Authorization: `${adminToken}`,
            },
          })
          .then(() => {
            setData(data.filter((d) => d?._id !== id));
            Swal.fire("Success!", "Specification has been deleted!", "success");
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "Specification has not been deleted!", "error");
          });
      }
    });
  };

  const handleMultipleDataDelete = () => {
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
          .delete(`${url}/data/deletes`, {
            data: { ids: idsToDelete },
            headers: {
              Authorization: `${adminToken}`,
            },
          })
          .then(() => {
            setData(data?.filter((d) => !idsToDelete?.includes(d?._id)));
            Swal.fire("Success!", "Specification has been deleted!", "success");
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "Specification has not been deleted!", "error");
          });
      }
    });
  };

  const handleDataUpdate = (data) => {
    dispatch(editData(data));
    Navigate("/editSpecification");
  };

  const handleDataStatus = async (datas, newStatus) => {
    try {
      await axios.patch(
        `${url}/data/update/status/${datas?._id}`,
        {
          Data_Status: newStatus,
        },
        {
          headers: {
            Authorization: `${adminToken}`,
          },
        }
      );

      const updatedData = data?.map((c) =>
        c._id === datas._id ? { ...c, Data_Status: newStatus } : c
      );
      setData(updatedData);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFilter = () => {
    const filteredDataList = data?.filter((data) => {
      const formattedDataName = (data?.name || "")
        .toUpperCase()
        .replace(/\s/g, "");
      let isDataName = true;
      if (dataName) {
        isDataName = formattedDataName.includes(
          dataName.toUpperCase().replace(/\s/g, "")
        );
      }

      return isDataName;
    });

    // Apply search query filtering
    const filteredData = filteredDataList.filter((data) => {
      const formattedSearchQuery = searchQuery.toUpperCase().replace(/\s/g, "");
      const rowValues = Object.values(data);
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

  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-2 table-heading">Specification List</div>
            <div className="d-flex flex-wrap gap-2 mt-2">
              <button
                onClick={() => Navigate("/addSpecification")}
                className="btn btn-primary waves-effect waves-light"
              >
                Add Specification <i className="fas fa-arrow-right ms-2"></i>
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
                    <div>{selectedRows.length} Specification selected</div>
                    <DeleteIcon
                      style={{ color: "red" }}
                      className="cursor-pointer"
                      onClick={() => handleMultipleDataDelete()}
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

export default ShowData;
