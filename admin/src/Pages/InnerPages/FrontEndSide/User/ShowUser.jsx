import { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import userImage from "../../../../resources/assets/images/3135715.png";
import { useDispatch } from "react-redux";
import { editUser } from "../../../../Redux/Actions/FronendActions/UserActionsAction";
import Modal from "react-modal";
import ImageModel from "../../../../Components/ImageComp/ImageModel";

let url = process.env.REACT_APP_API_URL;

const ShowUser = () => {
  useEffect(() => {
    Modal.setAppElement(document.body); // Set the appElement to document.body
  }, []);
  const [userData, setUserData] = useState([]);
  const [userAllData, setUserAllData] = useState([]);
  const userName = "";
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 100,
  });
  const [rowCount, setRowCount] = useState(0);
  const handlePaginationChange = (newPaginationModel) => {
    setPaginationModel(newPaginationModel);
  };
  // for big image
  const [selectedImage, setSelectedImage] = useState("");
  const [isModalOpenforImage, setIsModalOpenforImage] = useState(false);

  const handleImageClick = (imageURL) => {
    setSelectedImage(imageURL);
    setIsModalOpenforImage(true);
  };

  const Navigate = useNavigate();
  const dispatch = useDispatch();

  const localeText = {
    noRowsLabel: "No Data Found 😔",
  };

  const approveAccount = async (user) => {
    try {
      const adminToken = localStorage.getItem("token");
      await axios.patch(
        `${url}/user/update/byAdmin/${user?._id}`,
        {
          status: true,
        },
        {
          headers: {
            Authorization: `${adminToken}`,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const columns = [
    {
      field: "createdAt",
      flex: 1,
      headerName: "Created At",
      renderCell: (params) => {
        if (!params.value) return "";
        return new Date(params.value).toLocaleDateString("en-IN");
      },
    },
    {
      field: "User_Image",
      headerName: "Image",
      renderCell: (params) => (
        <img
          src={
            `${params?.value?.path}` !== "undefined"
              ? `${url}/${params?.value?.path}`
              : userImage
          }
          alt="User"
          height={35}
          width={35}
          style={{ borderRadius: "50%", cursor: "pointer" }}
          onClick={() =>
            handleImageClick(
              `${params?.value?.path}` !== "undefined"
                ? `${url}/${params?.value?.path}`
                : userImage
            )
          }
        />
      ),
      sortable: false,
      filterable: false,
    },
    // {
    //   field: "_id",
    //   flex: 2,
    //   headerName: "Id",
    // },
    {
      field: "User_Name",
      headerName: "Name",
      flex: 1,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "User_Email",
      headerName: "Email",
      flex: 2,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "User_Mobile_No",
      headerName: "Mobile No",
      flex: 1,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "Block",
      headerName: "Block",
      flex: 1,
      renderCell: (params) => (
        <div className="form-check form-switch-user">
          <input
            type="checkbox"
            className="form-check-input"
            id={`customSwitch-${params.id}`}
            onChange={() => handleUserStatus(params.row, !params.value)}
            checked={params.value}
            onClick={(event) => event.stopPropagation()}
          />
          <label
            className="form-check-label"
            htmlFor={`customSwitch-${params.id}`}
            style={{ color: params.value ? "red" : "grey" }}
          >
            {params.value ? "Block" : "UnBlock"}
          </label>
        </div>
      ),
      filterable: false,
      sortable: true,
      hide: false,
    },

    {
      field: "User_Status",
      headerName: "Approval Status",
      flex: 1,
      renderCell: (params) => (
        <div>
          {params.value ? (
            <label style={{ color: "green" }}>Approved</label>
          ) : (
            <button onClick={() => approveAccount(params.row)}>
              Approve Account
            </button>
          )}
        </div>
      ),
      filterable: false,
      sortable: true,
      hide: false,
    },
    {
      field: "action",
      headerName: "Actions",
      flex: 2,
      renderCell: (params) => (
        <Stack direction="row" gap={1}>
          <IconButton
            aria-label="delete"
            onClick={() => handleUserDelete(params.row._id)}
          >
            <i className="fas fa-trash-alt font-size-16 font-Icon-Del"></i>
          </IconButton>
          <IconButton
            aria-label="update"
            onClick={() => handleUserUpdate(params.row)}
          >
            <i className="fas fa-pencil-alt font-size-16 font-Icon-Up"></i>
          </IconButton>

          <button
            style={{
              height:35
            }}
            className="btn btn-primary waves-effect waves-light"
            onClick={() => handleMoreDeatails(params.row)}
          >
            More Details
          </button>
        </Stack>
      ),
      filterable: false,
      sortable: false,
      hide: false,
    },

    {
      field: "Admin_Remarks",
      headerName: "Admin Reamrks",
      width:250,
      renderCell:(params) => {
        return (
          <div style={{
            flexDirection:"column",
            margin:10
          }}>
            <p style={{
              margin:0,
              padding:0
            }}>
              { new Date(params.row.Admin_Remarks_At).toLocaleDateString()}
            </p>
            <p style={{
              margin:0,
              padding:0
            }}>
              {params.row.Admin_Remarks}
            </p>
            
          </div>
        )
      }
    },
  ];
  const adminToken = localStorage.getItem("token");

  async function getUser(page, pageSize) {
    setIsLoading(true);
    try {
      const res = await axios.get(`${url}/user/get`, {
        params: { page: page + 1, pageSize },
        headers: {
          Authorization: `${adminToken}`,
        },
      });
      setUserData(res?.data?.user || []);
      setRowCount(res?.data?.totalUsers);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  }

  async function getAllUsers() {
    setIsLoading(true);
    try {
      const res = await axios.get(`${url}/user/get`, {
        params: {},
        headers: {
          Authorization: `${adminToken}`,
        },
      });
      setUserAllData(res?.data?.user || []);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getUser(paginationModel.page, paginationModel.pageSize);
    getAllUsers();
  }, [paginationModel.page, paginationModel.pageSize]);

  const handleUserDelete = (id) => {
    console.log("id ==> ", id);
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
          .delete(`${url}/user/delete/${id}`, {
            headers: {
              Authorization: `${adminToken}`,
            },
          })
          .then(() => {
            getUser(paginationModel.page, paginationModel.pageSize);
            getAllUsers();
            Swal.fire("Success!", "User has been deleted!", "success");
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "User has not been deleted!", "error");
          });
      }
    });
  };

  const handleUserUpdate = (user) => {
    dispatch(editUser(user));
    Navigate("/editUser");
  };

  const handleMultipleUserDelete = () => {
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
          .delete(`${url}/user/deletes`, {
            headers: {
              Authorization: `${adminToken}`,
            },
            data: { ids: idsToDelete },
          })
          .then(() => {
            getUser(paginationModel.page, paginationModel.pageSize);
            getAllUsers();
            Swal.fire("Success!", "User has been deleted!", "success");
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "User has not been deleted!", "error");
          });
      }
    });
  };

  const handleUserStatus = async (user, newStatus) => {
    try {
      await axios.patch(`${url}/user/update/status/${user?._id}`, {
        Block: newStatus,
      });
      setUserData(
        userData.map((c) =>
          c._id === user._id ? { ...c, Block: newStatus } : c
        )
      );
      setUserAllData(
        userAllData.map((c) =>
          c._id === user._id ? { ...c, Block: newStatus } : c
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleFilter = () => {
    const filteredUserList = userAllData?.filter((user) => {
      const formattedUserName = (user?.name || "")
        .toUpperCase()
        .replace(/\s/g, "");
      let isUserName = true;
      if (userName) {
        isUserName = formattedUserName.includes(
          userName.toUpperCase().replace(/\s/g, "")
        );
      }

      return isUserName;
    });

    // Apply search query filtering
    const filteredData = filteredUserList.filter((user) => {
      const formattedSearchQuery = searchQuery.toUpperCase().replace(/\s/g, "");
      const rowValues = Object.values(user);
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

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [sending, setSending] = useState(false);

  const handleMoreDeatails = (user) => {
    console.log(user);
    setSelectedUser(user);
    setRemarks("");
    setIsDetailsModalOpen(true);
  };

  const sendMoreDetailsRequest = async () => {
    if (!remarks.trim()) {
      Swal.fire("Required", "Please enter remarks", "warning");
      return;
    }

    try {
      setSending(true);
      const adminToken = localStorage.getItem("token");

      await axios.post(
        `${url}/user/needMoreDetails/byAdmin/${selectedUser?._id}`,
        {
          userId: selectedUser?._id,
          remarks: remarks,
        },
        {
          headers: {
            Authorization: `${adminToken}`,
          },
        }
      );

      Swal.fire("Success", "Request sent to retailer", "success");
      setIsDetailsModalOpen(false);
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="main-content">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-2 table-heading">User List</div>
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
                    getRowHeight={() => "auto"}
                    style={{ textTransform: "capitalize", fontSize: 13 }}
                    rows={searchQuery === "" ? userData : handleFilter()} // Ensure this returns an array of valid rows
                    columns={columns} // Ensure columns are defined correctly
                    checkboxSelection
                    disableSelectionOnClick
                    getRowId={getRowId} // Ensure this function is defined and returns a unique ID
                    filterPanelDefaultOpen
                    filterPanelPosition="top"
                    slots={{
                      toolbar: (props) => (
                        <div>
                          <GridToolbar />
                        </div>
                      ),
                    }}
                    localeText={localeText} // Ensure localeText is defined correctly
                    loading={isLoading} // Ensure isLoading is a boolean
                    onCellClick={handleCellClick} // Ensure this function is defined
                    onRowSelectionModelChange={(e) => setSelectedRows(e)} // Ensure setSelectedRows is defined
                    pagination
                    paginationMode={searchQuery === "" ? "server" : "client"} // Enable server-side pagination
                    rowCount={
                      searchQuery === "" ? rowCount : handleFilter().length
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
                      <div>{selectedRows.length} User selected</div>
                      <DeleteIcon
                        style={{ color: "red" }}
                        className="cursor-pointer"
                        onClick={() => handleMultipleUserDelete()}
                      />
                    </div>
                  )}
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
      <Modal
        className="main-content dark"
        isOpen={isDetailsModalOpen}
        onRequestClose={() => setIsDetailsModalOpen(false)}
      >
        <div className="container p-5">
          <h4 className="mb-3">Need More Details</h4>

          <div className="form-group mb-3">
            <label>Remarks for Retailer</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Enter remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-secondary"
              onClick={() => setIsDetailsModalOpen(false)}
              disabled={sending}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              onClick={sendMoreDetailsRequest}
              disabled={sending}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ShowUser;
