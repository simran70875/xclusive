import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import Modal from "react-modal";
import EditVariationSize from "./EditVariationSize";
import AddVariationSize from "./AddVariationSize";

let url = process.env.REACT_APP_API_URL;
let getRowId = (row) => row._id;

const ShowVariationSize = () => {
  const adminToken = localStorage.getItem("token");
  const selectedVariationData = useSelector(
    (state) => state?.VariationSizeDataChange?.payload
  );
  let variationId = selectedVariationData?._id;

  const [sizeData, setsizeData] = useState([]);
  const [sizeName, setsizeName] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // for selected size data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddSizeModalOpen, setIsAddSizeModalOpen] = useState(false);
  const [selectedSizeData, setSelectedSizeData] = useState();

  useEffect(() => {
    Modal.setAppElement(document.body); // Set the appElement to document.body
  }, []);

  const handleOpenModal = (data, variationId) => {
    setSelectedSizeData(data?.row);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    async function getProduct() {
      try {
        const res = await axios.get(
          `${url}/product/variation/get/${selectedVariationData?._id}`,
          {
            headers: {
              Authorization: `${adminToken}`,
            },
          }
        );
        setsizeData(res?.data?.variation?.Size || []);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    }
    getProduct();
  }, []);

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
      field: "Size_Name",
      headerName: "Name",
      width: 160,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "Size_Stock",
      headerName: "Total Stock",
      width: 160,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "Size_Price",
      headerName: "Price",
      width: 160,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
      renderCell: (params) => {
        return <p className="mb-0">£ {params.row.Size_Price}</p>;
      },
    },
    // {
    //     field: "Size_Status",
    //     headerName: "Status",
    //     width: 160,
    //     renderCell: (params) => (
    //         <div className="form-check form-switch">
    //             <input
    //                 type="checkbox"
    //                 className="form-check-input"
    //                 id={`customSwitch-${params.id}`}
    //                 onChange={() => handleVariationSizeStatus(params.row, !params.value)}
    //                 checked={params.value}
    //                 onClick={(event) => event.stopPropagation()}
    //             />
    //             <label
    //                 className="form-check-label"
    //                 htmlFor={`customSwitch-${params.id}`}
    //                 style={{ color: params.value ? "green" : "grey" }}
    //             >
    //                 {params.value ? "Enable" : "Disable"}
    //             </label>
    //         </div>
    //     ),
    //     filterable: true,
    //     sortable: true,
    //     filterType: "dropdown",
    //     hide: false,
    // },
    {
      field: "action",
      headerName: "Action",
      width: 160,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton
            aria-label="delete"
            onClick={() => handleSizeDelete(params.row._id)}
          >
            <i className="fas fa-trash-alt font-size-16 font-Icon-Del"></i>
          </IconButton>
          <IconButton
            aria-label="edit"
            onClick={() => handleOpenModal(params, variationId)}
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

  const handleSizeDelete = (sizeId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this size!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(
            `${url}/product/variation/delete/size/${selectedVariationData?._id}/${sizeId}`,
            {
              headers: {
                Authorization: `${adminToken}`,
              },
            }
          )
          .then(() => {
            // Fetch the updated variation data after deletion
            axios
              .get(
                `${url}/product/variation/get/${selectedVariationData?._id}`,
                {
                  headers: {
                    Authorization: `${adminToken}`,
                  },
                }
              )
              .then((response) => {
                const updatedVariationData = response?.data?.variation?.Size;
                setsizeData(updatedVariationData || []);
                Swal.fire("Success!", "Size has been deleted!", "success");
              })
              .catch((err) => {
                console.log(err);
                Swal.fire("Error!", "Size has not been deleted!", "error");
              });
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "Size has not been deleted!", "error");
          });
      }
    });
  };

  const handleMultiplevariationDelete = () => {
    let idsToDelete = selectedRows.map((row) => row);

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
          .delete(
            `${url}/product/variation/deletes/sizes/${selectedVariationData?._id}`,
            {
              data: {
                sizeIds: idsToDelete,
              },
              headers: {
                Authorization: `${adminToken}`,
              },
            }
          )
          .then(() => {
            // Fetch the updated variation data after deletion
            axios
              .get(
                `${url}/product/variation/get/${selectedVariationData?._id}`,
                {
                  headers: {
                    Authorization: `${adminToken}`,
                  },
                }
              )
              .then((response) => {
                const updatedVariationData = response?.data?.variation?.Size;
                setsizeData(updatedVariationData || []);
                Swal.fire("Success!", "Sizes have been deleted!", "success");
              })
              .catch((err) => {
                console.log(err);
                Swal.fire("Error!", "Sizes have not been deleted!", "error");
              });
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "Sizes have not been deleted!", "error");
          });
      }
    });
  };

  const handleSizeUpdate = (sizeId, updatedSizeData) => {
    // Find the index of the updated size in the sizeData array
    const sizeIndex = sizeData.findIndex((size) => size._id === sizeId);
    if (sizeIndex !== -1) {
      // Create a copy of sizeData to update the specific size
      const updatedSizeDataList = [...sizeData];
      updatedSizeDataList[sizeIndex] = {
        ...updatedSizeDataList[sizeIndex],
        ...updatedSizeData,
      };
      setsizeData(updatedSizeDataList || []);
    }
  };

  const handleVariationSizeStatus = async (size, newStatus) => {
    try {
      await axios.patch(
        `${url}/product/variation/update/size/status/${selectedVariationData?._id}/${size?._id}`,
        {
          Size_Status: newStatus,
        },
        {
          headers: {
            Authorization: `${adminToken}`,
          },
        }
      );

      const updatedVariationSizeData = sizeData?.map((c) =>
        c._id === size._id ? { ...c, Size_Status: newStatus } : c
      );
      setsizeData(updatedVariationSizeData || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFilter = () => {
    const filteredvariationList = sizeData?.filter((variation) => {
      const formattedsizeName = (variation?.name || "")
        .toUpperCase()
        .replace(/\s/g, "");
      let issizeName = true;
      if (sizeName) {
        issizeName = formattedsizeName.includes(
          sizeName.toUpperCase().replace(/\s/g, "")
        );
      }

      return issizeName;
    });

    // Apply search query filtering
    const filteredData = filteredvariationList?.filter((variation) => {
      const formattedSearchQuery = searchQuery.toUpperCase().replace(/\s/g, "");
      const rowValues = Object.values(variation);
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

  const handleCellClick = (params, event) => {
    // Prevent row selection when clicking on the switch
    if (event.target.type !== "checkbox") {
      event.stopPropagation();
    }
  };

  const handleOpenAddSizeModal = () => {
    setIsAddSizeModalOpen(true);
  };

  const handleCloseAddSizeModal = () => {
    setIsAddSizeModalOpen(false);
  };

  const handleSizeAdd = async (newSizeData) => {
    // setsizeData((prevSizeData) => [...prevSizeData, newSizeData]);
    const res = await axios.get(
      `${url}/product/variation/get/${selectedVariationData?._id}`,
      {
        headers: {
          Authorization: `${adminToken}`,
        },
      }
    );
    const updatedResponse = res?.data?.variation?.Size;
    setsizeData(updatedResponse || []);
  };

  return (
    <>
      <div className="main-content">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-2 table-heading">Variation Sizes List</div>
              <div className="d-flex flex-wrap gap-2 mt-2">
                <button
                  onClick={handleOpenAddSizeModal}
                  className="btn btn-primary waves-effect waves-light"
                >
                  Add Size <i className="fas fa-arrow-right ms-2"></i>
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
                <div className="card">
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
                        <div>
                          {selectedRows.length} Variations Size selected
                        </div>
                        <DeleteIcon
                          style={{ color: "red" }}
                          className="cursor-pointer"
                          onClick={() => handleMultiplevariationDelete()}
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
      <Modal
        className="main-content dark"
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
      >
        <EditVariationSize
          handleCloseModal={handleCloseModal}
          selectedSizeData={selectedSizeData}
          variationId={variationId}
          handleSizeUpdate={handleSizeUpdate}
        />
      </Modal>
      <Modal
        className="main-content dark"
        isOpen={isAddSizeModalOpen}
        onRequestClose={handleCloseAddSizeModal}
      >
        <AddVariationSize
          handleCloseModal={handleCloseAddSizeModal}
          variationId={variationId}
          handleSizeAdd={handleSizeAdd}
        />
      </Modal>
    </>
  );
};

export default ShowVariationSize;
