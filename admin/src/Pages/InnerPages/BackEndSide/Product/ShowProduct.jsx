import { useEffect, useRef, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { editProduct } from "../../../../Redux/Actions/BackendActions/ProductAction";
import { showVariation } from "../../../../Redux/Actions/BackendActions/VariationAction";
import { FormControl, MenuItem, Select } from "@mui/material";
import ImageModel from "../../../../Components/ImageComp/ImageModel";
import Modal from "react-modal";

let url = process.env.REACT_APP_API_URL;

const ShowProduct = () => {
  const adminToken = localStorage.getItem("token");

  const [productData, setProductData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
      field: "Product_Images",
      headerName: "Image",
      width: 90,
      renderCell: (params) => (
        <img
          src={`${process.env.REACT_APP_API_URL}/${params?.row?.Product_Images[0].path}`}
          alt="Product Image"
          height={35}
          width={35}
          style={{ borderRadius: "50%", cursor: "pointer" }}
          onClick={() => handleImageClick(params?.row?.Product_Image)}
        />
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: "_id",
      flex: 2,
      headerName: "Id",
    },
    {
      field: "Product_Name",
      headerName: "Product Name",
      flex: 2,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "SKU_Code",
      headerName: "SKU Code",
      width: 90,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "category",
      headerName: "Category",
      width: 90,
      filterable: true,
      sortable: true,

      filterType: "multiselect",
    },
    {
      field: "brand",
      headerName: "Brand",
      width: 90,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "collection",
      headerName: "collection",
      width: 90,
      filterable: true,
      sortable: true,
      filterType: "multiselect",
    },
    {
      field: "Features",
      headerName: "Features",
      flex: 1,
      renderCell: (params) => {
        const selectedFeature = params.row["Features"];
        return (
          <FormControl variant="outlined" size="small">
            <Select
              style={{ height: "20px", width: "100px" }}
              value={getSelectedFeatureValue(params.row)}
              onChange={(e) =>
                handleProductFeatures(params.row, !params.value, e.target.value)
              }
            >
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="popular">Popular Pick</MenuItem>
              <MenuItem value="trendy">Trendy Collection</MenuItem>
              <MenuItem value="home">Best Selling</MenuItem>
            </Select>
          </FormControl>
        );
      },
      filterable: false,
      sortable: false,
      editable: true, // Allow editing the features directly in the DataGrid
    },
    {
      field: "Product_Status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <div className="form-check form-switch">
          <input
            type="checkbox"
            className="form-check-input"
            id={`customSwitch-${params.id}`}
            onChange={() => handleProductStatus(params.row, !params.value)}
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
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton
            aria-label="delete"
            onClick={() => handleProductDelete(params.row._id)}
          >
            <i className="fas fa-trash-alt font-size-16 font-Icon-Del"></i>
          </IconButton>
          <IconButton
            aria-label="edit"
            onClick={() => handleProductUpdate(params.row)}
          >
            <i className="fas fa-pencil-alt font-size-16 font-Icon-Up"></i>
          </IconButton>
        </Stack>
      ),
      filterable: false,
      sortable: false,
      hide: false,
    },
    {
      field: "Variation",
      headerName: "Variation",
      width: 90,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton
            aria-label="delete"
            onClick={() => handleVariationView(params.row)}
          >
            <i className="fas fa-eye font-Icon-view" />
          </IconButton>
        </Stack>
      ),
      filterable: false,
      sortable: false,
      hide: false,
    },
  ];

  async function getProduct() {
    try {
      const res = await axios.get(`${url}/product/get`, {
        headers: {
          Authorization: `${adminToken}`,
        },
      });
      console.log(res);

      setProductData(res?.data?.product || []);

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getProduct();
  }, []);

  // Trigger hidden input
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // Validate file
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      Swal.fire({
        icon: "error",
        title: "Invalid File",
        text: "Please upload a valid CSV file!",
      });
      e.target.value = ""; // reset
      return;
    }

    setCsvFile(file);
    handleUpload(file); // Automatically upload after selecting
  };

  const handleUpload = async (selectedFile) => {
    const fileToUpload = selectedFile || csvFile;
    if (!fileToUpload) {
      Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please choose a CSV file before uploading.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("csvFile", fileToUpload);

    try {
      setLoading(true);
      setUploadProgress(0);

      await axios.post(`${url}/product/upload-csv`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `${adminToken}`,
        },
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(percent);
        },
      });

      setLoading(false);
      setUploadProgress(100);

      Swal.fire({
        icon: "success",
        title: "CSV Uploaded Successfully!",
        toast: true,
        timer: 1500,
        position: "top-end",
        showConfirmButton: false,
      });

      getProduct();
      setCsvFile(null);
    } catch (err) {
      setLoading(false);

      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "An error occurred while uploading.",
      });
    }
  };

  const handleProductDelete = (id) => {
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
          .delete(`${url}/product/delete/${id}`, {
            headers: {
              Authorization: `${adminToken}`,
            },
          })
          .then(() => {
            setProductData(productData.filter((d) => d?._id !== id));
            Swal.fire("Success!", "Product has been deleted!", "success");
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "Product has not been deleted!", "error");
          });
      }
    });
  };

  const handleMultipleProductDelete = () => {
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
          .delete(`${url}/product/deletes`, {
            data: { ids: idsToDelete },
            headers: {
              Authorization: `${adminToken}`,
            },
          })
          .then(() => {
            setProductData(
              productData?.filter((d) => !idsToDelete?.includes(d?._id))
            );
            Swal.fire("Success!", "Product has been deleted!", "success");
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "Product has not been deleted!", "error");
          });
      }
    });
  };

  const handleProductUpdate = (product) => {
    dispatch(editProduct(product));
    Navigate("/editProduct");
  };

  const handleVariationView = (product) => {
    dispatch(showVariation(product));
    Navigate("/showVariation");
  };

  const handleProductStatus = async (product, newStatus) => {
    try {
      await axios.patch(
        `${url}/product/update/status/${product?._id}`,
        {
          Product_Status: newStatus,
        },
        {
          headers: {
            Authorization: `${adminToken}`,
          },
        }
      );

      const updatedProductData = productData.map((c) =>
        c._id === product._id ? { ...c, Product_Status: newStatus } : c
      );
      setProductData(updatedProductData);
    } catch (error) {
      console.log(error);
    }
  };

  const handleProductFeatures = async (product, newStatus, name) => {
    let trendyStatus = false;
    let popularStatus = false;
    let homeStatus = false;

    if (name === "trendy") {
      trendyStatus = newStatus;
    } else if (name === "popular") {
      popularStatus = newStatus;
    } else if (name === "home") {
      homeStatus = newStatus;
    }

    try {
      await axios.patch(
        `${url}/product/update/features/${product?._id}`,
        {
          Popular_pick: popularStatus,
          Trendy_collection: trendyStatus,
          HomePage: homeStatus,
        },
        {
          headers: {
            Authorization: `${adminToken}`,
          },
        }
      );

      const updatedProductData = productData.map((c) =>
        c._id === product._id
          ? {
              ...c,

              Popular_pick: popularStatus,
              Trendy_collection: trendyStatus,
              HomePage: homeStatus,
            }
          : c
      );
      setProductData(updatedProductData);
    } catch (error) {
      console.log(error);
    }
  };

  const handleProductShipping = async (product, newStatus, name) => {
    try {
      await axios.patch(
        `${url}/product/update/shipping/${product?._id}`,
        {
          Shipping: name,
        },
        {
          headers: {
            Authorization: `${adminToken}`,
          },
        }
      );

      const updatedProductData = productData.map((c) =>
        c._id === product._id
          ? {
              ...c,
              Shipping: name,
            }
          : c
      );
      setProductData(updatedProductData);
    } catch (error) {
      console.log(error);
    }
  };

  const getSelectedFeatureValue = (product) => {
    if (product?.Popular_pick) {
      return "popular";
    } else if (product?.Trendy_collection) {
      return "trendy";
    } else if (product?.HomePage) {
      return "home";
    } else {
      return "none";
    }
  };

  const getSelectedShippingValue = (product) => {
    if (product?.Shipping === "PRE LAUNCH") {
      return "PRE LAUNCH";
    } else if (product?.Shipping === "READY TO SHIP") {
      return "READY TO SHIP";
    } else {
      return "none";
    }
  };

  const handleFilter = () => {
    // Apply search query filtering
    const filteredData = productData.filter((product) => {
      const formattedSearchQuery = searchQuery.toUpperCase().replace(/\s/g, "");
      const rowValues = Object.values(product);
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
    // Prevent row selection when clicking on the switch
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
              <div className="col-2 table-heading">Product List</div>
              <div className="d-flex flex-wrap gap-2 mt-2">
                <button
                  onClick={() => Navigate("/addProduct")}
                  className="btn btn-primary waves-effect waves-light"
                >
                  Add Product <i className="fas fa-arrow-right ms-2"></i>
                </button>
                <div className="flex flex-col gap-3">
                  {/* Hidden Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />

                  {/* Visible Button */}
                  <button
                    className="btn btn-primary"
                    onClick={handleButtonClick}
                    disabled={loading}
                  >
                    {loading ? "Uploading..." : "Import CSV"}
                  </button>

                  {/* Progress Bar */}
                  {loading && (
                    <div className="w-full bg-gray-300 rounded h-3 mt-1">
                      <div
                        className="bg-blue-600 h-3 rounded"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
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
                        <div>{selectedRows.length} Product selected</div>
                        <DeleteIcon
                          style={{ color: "red" }}
                          className="cursor-pointer"
                          onClick={() => handleMultipleProductDelete()}
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

export default ShowProduct;
