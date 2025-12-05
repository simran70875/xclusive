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
import { editCategory } from "../../../../Redux/Actions/BackendActions/CategoryActions";
import Modal from "react-modal";
import ImageModel from "../../../../Components/ImageComp/ImageModel";

let url = process.env.REACT_APP_API_URL;

const ShowCategory = () => {
  const adminToken = localStorage.getItem("token");

  const [categoryData, setCategoryData] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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

  const columns = [
    {
      field: "_id",
      width: 300,
      headerName: "Id",
    },
    {
      field: "Category_Name",
      headerName: "Category Name",
      width: 225,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "Category_Image",
      headerName: "Image",
      width: 150,
      renderCell: (params) => (
        <img
          src={params?.row?.Category_Image}
          alt="Category Image"
          height={35}
          width={35}
          style={{ borderRadius: "50%", cursor: "pointer" }}
          onClick={() => handleImageClick(params?.row?.Category_Image)}
        />
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: "Category_Sec_Image",
      headerName: "Second Image",
      width: 150,
      renderCell: (params) => (
        <img
          src={params?.row?.Category_Sec_Image}
          alt="Category Image"
          height={35}
          width={35}
          style={{ borderRadius: "50%", cursor: "pointer" }}
          onClick={() => handleImageClick(params?.row?.Category_Sec_Image)}
        />
      ),
      sortable: false,
    },
    {
      field: "Category_Status",
      headerName: "Status",
      width: 220,
      renderCell: (params) => (
        <div className="form-check form-switch">
          <input
            type="checkbox"
            className="form-check-input"
            id={`customSwitch-${params.id}`}
            onChange={() => handleCategoryStatus(params.row, !params.value)}
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
      field: "Category_Feature",
      headerName: "In The Spot Light",
      width: 220,
      renderCell: (params) => (
        <div className="form-check form-switch">
          <input
            type="checkbox"
            className="form-check-input"
            id={`customSwitch-${params.id}`}
            onChange={() =>
              handleCategoryFeatureStatus(params.row, !params.value)
            }
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
      width: 200,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton
            aria-label="delete"
            onClick={() => handleCategoryDelete(params.row._id)}
          >
            <i class="fas fa-trash-alt font-size-16 font-Icon-Del"></i>
          </IconButton>
          <IconButton
            aria-label="edit"
            onClick={() => handleCategoryUpdate(params.row)}
          >
            <i class="fas fa-pencil-alt font-size-16 font-Icon-Up"></i>
          </IconButton>
        </Stack>
      ),
      filterable: false,
      sortable: false,
      hide: false,
    },
  ];

  useEffect(() => {
    async function getCategory() {
      try {
        const res = await axios.get(`${url}/category/get`, {
          headers: {
            Authorization: `${adminToken}`,
          },
        });

        setCategoryData(res?.data?.category || []);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    }
    getCategory();
  }, []);

  const handleCategoryDelete = (id) => {
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
          .delete(`${url}/category/delete/${id}`, {
            headers: {
              Authorization: `${adminToken}`,
            },
          })
          .then(() => {
            setCategoryData(categoryData.filter((d) => d?._id !== id));
            Swal.fire("Success!", "Category has been deleted!", "success");
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "Category has not been deleted!", "error");
          });
      }
    });
  };

  const handleMultipleCategoryDelete = () => {
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
          .delete(`${url}/category/deletes`, {
            data: { ids: idsToDelete },
            headers: {
              Authorization: `${adminToken}`,
            },
          })
          .then(() => {
            setCategoryData(
              categoryData?.filter((d) => !idsToDelete?.includes(d?._id))
            );
            Swal.fire("Success!", "Category has been deleted!", "success");
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "Category has not been deleted!", "error");
          });
      }
    });
  };

  const handleCategoryUpdate = (category) => {
    dispatch(editCategory(category));
    Navigate("/editCategory");
  };

  const handleCategoryStatus = async (category, newStatus) => {
    try {
      await axios.patch(
        `${url}/category/update/status/${category?._id}`,
        {
          Category_Status: newStatus,
        },
        {
          headers: {
            Authorization: `${adminToken}`,
          },
        }
      );

      const updatedCategoryData = categoryData.map((c) =>
        c._id === category._id ? { ...c, Category_Status: newStatus } : c
      );
      setCategoryData(updatedCategoryData);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCategoryFeatureStatus = async (category, newStatus) => {
    try {
      await axios.patch(
        `${url}/category/update/feature/${category?._id}`,
        {
          Category_Feature: newStatus,
        },
        {
          headers: {
            Authorization: `${adminToken}`,
          },
        }
      );

      const updatedCategoryData = categoryData.map((c) =>
        c._id === category._id ? { ...c, Category_Feature: newStatus } : c
      );
      setCategoryData(updatedCategoryData);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFilter = () => {
    const filteredCategoryList = categoryData?.filter((category) => {
      const formattedCategoryName = (category?.name || "")
        .toUpperCase()
        .replace(/\s/g, "");
      let isCategoryName = true;
      if (categoryName) {
        isCategoryName = formattedCategoryName.includes(
          categoryName.toUpperCase().replace(/\s/g, "")
        );
      }

      return isCategoryName;
    });

    // Apply search query filtering
    const filteredData = filteredCategoryList.filter((category) => {
      const formattedSearchQuery = searchQuery.toUpperCase().replace(/\s/g, "");
      const rowValues = Object.values(category);
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
              <div className="col-2 table-heading">Category List</div>
              <div className="d-flex flex-wrap gap-2 mt-2">
                <button
                  onClick={() => Navigate("/addCategory")}
                  className="btn btn-primary waves-effect waves-light"
                >
                  Add Category <i className="fas fa-arrow-right ms-2"></i>
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
                        <div>{selectedRows.length} Categories selected</div>
                        <DeleteIcon
                          style={{ color: "red" }}
                          className="cursor-pointer"
                          onClick={() => handleMultipleCategoryDelete()}
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

export default ShowCategory;
