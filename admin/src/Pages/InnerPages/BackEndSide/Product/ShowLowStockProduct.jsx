import { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Modal from "react-modal";
import EditVariationSizeStock from "./EditVariationSizeStock";
import ImageModel from "../../../../Components/ImageComp/ImageModel";

let url = process.env.REACT_APP_API_URL;

const ShowLowStockProducts = () => {
  const adminToken = localStorage.getItem("token");
  const [productData, setProductData] = useState([]);
  const [productName, setProductName] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  // for big image
  const [selectedImage, setSelectedImage] = useState("");
  const [isModalOpenforImage, setIsModalOpenforImage] = useState(false);

  const handleImageClick = (imageURL) => {
    setSelectedImage(imageURL);
    setIsModalOpenforImage(true);
  };

  const Navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    async function getLowStockProducts() {
      try {
        const response = await axios.get(
          `${url}/product/lowstockproducts/get`,
          {
            headers: {
              Authorization: `${adminToken}`,
            },
          }
        );
        setLowStockProducts(response?.data?.low_stock_variation_sizes || []);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error(error);
      }
    }
    getLowStockProducts();
  }, [lowStockProducts]);

  // for selected size data
  const [sizeData, setsizeData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSizeData, setSelectedSizeData] = useState();
  const [variationId, setVariationId] = useState("");

  useEffect(() => {
    Modal.setAppElement(document.body);
  }, []);

  const handleOpenModal = (data, variationId) => {
    setSelectedSizeData(data?.row);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
      setLowStockProducts(updatedSizeDataList);
    }
  };

  const localeText = {
    noRowsLabel: "No Data Found 😔",
  };

  const columns = [
    {
      field: "Product_Name",
      headerName: "Product Name",
      width: 200,
    },
    {
      field: "SKU_Code",
      headerName: "SKU Code",
      width: 120,
    },
    {
      field: "Category",
      headerName: "Category",
      width: 150,
    },
    {
      field: "Variation_Name",
      headerName: "Color",
      width: 150,
    },
    {
      field: "Product_Image",
      headerName: "Image",
      width: 100,
      renderCell: (params) => (
        <img
          src={params?.row?.Product_Image}
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
      field: "Size_Name",
      headerName: "Size Name",
      width: 120,
    },
    {
      field: "Size_Stock",
      headerName: "Size Stock",
      width: 120,
    },
    {
      field: "action",
      headerName: "Action",
      width: 160,
      renderCell: (params) => {
        setVariationId(params?.row?.Variation_Id);
        return (
          <Stack direction="row">
            <IconButton
              aria-label="edit"
              onClick={() => handleOpenModal(params, variationId)}
            >
              <i className="fas fa-pencil-alt font-size-16 font-Icon-Up"></i>
            </IconButton>
          </Stack>
        );
      },
      filterable: false,
      sortable: false,
      hide: false,
    },
  ];

  const handleFilter = () => {
    const filteredProductList = lowStockProducts?.filter((product) => {
      const formattedProductName = (product?.name || "")
        .toUpperCase()
        .replace(/\s/g, "");
      let isProductName = true;
      if (productName) {
        isProductName = formattedProductName.includes(
          productName.toUpperCase().replace(/\s/g, "")
        );
      }

      return isProductName;
    });

    // Apply search query filtering
    const filteredData = filteredProductList.filter((product) => {
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
              <div className="col-3 table-heading">Low Stock Product List</div>
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
        <EditVariationSizeStock
          handleCloseModal={handleCloseModal}
          selectedSizeData={selectedSizeData}
          variationId={variationId}
          handleSizeUpdate={handleSizeUpdate}
        />
      </Modal>
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

export default ShowLowStockProducts;
