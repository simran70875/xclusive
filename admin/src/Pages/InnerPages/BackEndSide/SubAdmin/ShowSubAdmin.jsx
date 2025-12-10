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
import { editSubAdmin } from "../../../../Redux/Actions/AdminActions/AdminActions";
import Modal from "react-modal";
import ImageModel from "../../../../Components/ImageComp/ImageModel";

let url = process.env.REACT_APP_API_URL;

const ShowSubAdmin = () => {
  const adminToken = localStorage.getItem("token");

  const [subAdminData, setSubAdminData] = useState([]);
  const [subAdminName, setSubAdminName] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // for big image
  const [selectedImage, setSelectedImage] = useState("");
  const [isModalOpenforImage, setIsModalOpenforImage] = useState(false);

//   const handleImageClick = (imageURL) => {
//     setSelectedImage(imageURL);
//     setIsModalOpenforImage(true);
//   };

  const Navigate = useNavigate();
  const dispatch = useDispatch();

  const localeText = {
    noRowsLabel: "No Data Found 😔",
  };

  const columns = [
    {
      field: "_id",
      width: 300,
      headerName: "Id",
    },
    {
      field: "name",
      headerName: "Name",
      width: 225,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "username",
      headerName: "User_Name",
      width: 225,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "role",
      headerName: "Role",
      width: 225,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton
            aria-label="delete"
            onClick={() => handleSubAdminDelete(params.row._id)}
          >
            <i className="fas fa-trash-alt font-size-16 font-Icon-Del"></i>
          </IconButton>
          <IconButton
            aria-label="edit"
            onClick={() => handleSubAdminUpdate(params.row)}
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
    async function getSubAdmin() {
      try {
        const res = await axios.get(`${url}/subAdmin/get`, {
          headers: {
            Authorization: `${adminToken}`,
          },
        });

        setSubAdminData(res?.data?.subAdmins || []);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    }
    getSubAdmin();
  }, []);

  const handleSubAdminDelete = (id) => {
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
          .delete(`${url}/subAdmin/delete/${id}`, {
            headers: {
              Authorization: `${adminToken}`,
            },
          })
          .then(() => {
            setSubAdminData(subAdminData.filter((d) => d?._id !== id));
            Swal.fire("Success!", "SubAdmin has been deleted!", "success");
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "SubAdmin has not been deleted!", "error");
          });
      }
    });
  };

  const handleMultipleSubAdminDelete = () => {
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
          .delete(`${url}/subAdmin/deletes`, {
            data: { ids: idsToDelete },
            headers: {
              Authorization: `${adminToken}`,
            },
          })
          .then(() => {
            setSubAdminData(
              subAdminData?.filter((d) => !idsToDelete?.includes(d?._id))
            );
            Swal.fire("Success!", "SubAdmin has been deleted!", "success");
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "SubAdmin has not been deleted!", "error");
          });
      }
    });
  };

  const handleSubAdminUpdate = (subAdmin) => {
    dispatch(editSubAdmin(subAdmin));
    Navigate("/editSubAdmin");
  };

  const handleFilter = () => {
    const filteredSubAdminList = subAdminData?.filter((subAdmin) => {
      const formattedSubAdminName = (subAdmin?.name || "")
        .toUpperCase()
        .replace(/\s/g, "");
      let isSubAdminName = true;
      if (subAdminName) {
        isSubAdminName = formattedSubAdminName.includes(
          subAdminName.toUpperCase().replace(/\s/g, "")
        );
      }

      return isSubAdminName;
    });

    // Apply search query filtering
    const filteredData = filteredSubAdminList.filter((subAdmin) => {
      const formattedSearchQuery = searchQuery.toUpperCase().replace(/\s/g, "");
      const rowValues = Object.values(subAdmin);
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
    <>
      <div className="main-content">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-2 table-heading">Sub-Admin List</div>
              <div className="d-flex flex-wrap gap-2 mt-2">
                <button
                  onClick={() => Navigate("/addSubAdmin")}
                  className="btn btn-primary waves-effect waves-light"
                >
                  Add Sub-Admin <i className="fas fa-arrow-right ms-2"></i>
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
                <div className="">
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
                        <div>{selectedRows.length} Sub-Admin selected</div>
                        <DeleteIcon
                          style={{ color: "red" }}
                          className="cursor-pointer"
                          onClick={() => handleMultipleSubAdminDelete()}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal className="main-content dark" isOpen={isModalOpenforImage}>
        <ImageModel
          isOpen={isModalOpenforImage}
          onClose={() => setIsModalOpenforImage(false)}
          imageURL={selectedImage}
        />
      </Modal>
    </>
  );
};

export default ShowSubAdmin;
