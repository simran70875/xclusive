import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar} from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ImageModel from '../../../../Components/ImageComp/ImageModel'
import Modal from "react-modal";

// import { editvariation } from '../../../../Redux/Actions/BackendActions/variationAction';
import { showVariationSize } from '../../../../Redux/Actions/BackendActions/VariationAction'
import EditVariation from "./EditVariation";
import AddVariationByTable from "./AddVariationByTable";


let url = process.env.REACT_APP_API_URL


const Showvariation = () => {

    const adminToken = localStorage.getItem('token');
    const Navigate = useNavigate()
    const selectedVariationData = useSelector((state) => state?.VariationDataChange?.payload)
    const dispatch = useDispatch()

    const [variationData, setvariationData] = useState([]);
    const [variationName, setvariationName] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true)

    // edit variation
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVariation, setSelectedVariation] = useState()

    // add variation
    const [variations, setVariations] = useState([]);
    const [variationAddModel, setVariationAddModel] = useState(false)

    // for big image
    const [selectedImage, setSelectedImage] = useState("");
    const [isModalOpenforImage, setIsModalOpenforImage] = useState(false);

    const handleImageClick = (imageURL) => {
        setSelectedImage(imageURL);
        setIsModalOpenforImage(true);
    };

    useEffect(() => {
        Modal.setAppElement(document.body); // Set the appElement to document.body
    }, []);

    const handleOpenModal = (data, variationId) => {
        setSelectedVariation(data?.row)
        setIsModalOpen(true);
    };

    const handleOpenAddVariationModel = () => {
        setVariationAddModel(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleCloseAddVariationModel = async () => {
        setVariationAddModel(false)
        const res = await axios.get(`${url}/product/get/${selectedVariationData?._id}`,
            {
                headers: {
                    Authorization: `${adminToken}`,
                },
            });
        let updateData = res?.data?.products?.Variation
        setvariationData(updateData)
    }


    useEffect(() => {
        async function getVariation() {
            try {
                const res = await axios.get(`${url}/product/get/${selectedVariationData?._id}`,
                    {
                        headers: {
                            Authorization: `${adminToken}`,
                        },
                    });
                setvariationData(res?.data?.products?.Variation)
                setIsLoading(false)
            } catch (error) {
                setIsLoading(false)
            }
        }
        getVariation();
    }, []);

    const localeText = {
        noRowsLabel: "No Data Found 😔",
    };

    const columns = [
        {
            field: "_id",
            width: 90,
            headerName: "Id",
        },
        {
            field: "variation_Name",
            headerName: "Color Name",
            width: 120,
            filterable: true,
            sortable: true,
            filterType: "multiselect",
        },
        {
            field: "Variation_Image",
            headerName: "Image",
            width: 225,
            renderCell: (params) => (
                <img
                    src={params?.row?.variation_Images?.[0]?.variation_Image}
                    alt="Variation Image"
                    height={35}
                    width={35}
                    style={{ borderRadius: '50%', cursor: "pointer" }}
                    onClick={() => handleImageClick(params?.row?.variation_Images?.[0]?.variation_Image)}
                />
            ),
            sortable: false,
            filterable: false,
        },
        {
            field: "size_count",
            headerName: "Total Size",
            width: 90,
            filterable: true,
            sortable: true,
            filterType: "multiselect",
        },
        {
            field: "variation_Status",
            headerName: "Status",
            width: 120,
            renderCell: (params) => (
                <div className="form-check form-switch">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id={`customSwitch-${params.id}`}
                        onChange={() => handleVariationStatus(params.row, !params.value)}
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
            width: 90,
            renderCell: (params) => (
                <Stack direction="row">
                    <IconButton
                        aria-label="delete"
                        onClick={() => handlevariationDelete(params.row._id)}
                    >
                        <i className="fas fa-trash-alt font-size-16 font-Icon-Del"></i>
                    </IconButton>
                    <IconButton
                        aria-label="edit"
                        onClick={() => handleOpenModal(params)}
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
            field: "Sizes",
            headerName: "Sizes",
            width: 90,
            renderCell: (params) => (
                <Stack direction="row">
                    <IconButton
                        aria-label="delete"
                        onClick={() => handleSizeView(params.row)}
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

    const handlevariationDelete = (id) => {
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
                    .delete(`${url}/product/variation/delete/${id}`,
                        {
                            headers: {
                                Authorization: `${adminToken}`,
                            },
                        })
                    .then(() => {
                        setvariationData(variationData?.filter((d) => d?._id !== id));
                        Swal.fire("Success!", "variation has been deleted!", "success");
                    })
                    .catch((err) => {
                        console.log(err);
                        Swal.fire("Error!", "variation has not been deleted!", "error");
                    });
            }
        });
    };


    const handleMultiplevariationDelete = () => {
        let idsToDelete = selectedRows
        console.log(idsToDelete, "selecyt")

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
                    .delete(`${url}/product/variation/deletes`, {
                        data: { ids: idsToDelete },
                        headers: {
                            Authorization: `${adminToken}`,
                        },
                    })
                    .then(() => {
                        setvariationData(variationData?.filter((d) => !idsToDelete?.includes(d?._id)));
                        Swal.fire("Success!", "variation has been deleted!", "success");
                    })
                    .catch((err) => {
                        console.log(err);
                        Swal.fire("Error!", "variation has not been deleted!", "error");
                    });
            }
        });
    };

    const handleVariationUpdate = async () => {
        const res = await axios.get(`${url}/product/get/${selectedVariationData?._id}`,
            {
                headers: {
                    Authorization: `${adminToken}`,
                },
            });
        const updatedData = res?.data?.products?.Variation
        setvariationData(updatedData)
    };

    const handleSizeView = (size) => {
        dispatch(showVariationSize(size))
        Navigate('/showVariationSize')
    };

    const handleVariationStatus = async (variation, newStatus) => {
        try {
            await axios.patch(
                `${url}/product/variation/update/status/${variation?._id}`,
                {
                    variation_Status: newStatus,
                },
                {
                    headers: {
                        Authorization: `${adminToken}`,
                    },
                }
            );

            const updatedVariationData = variationData?.map((c) =>
                c._id === variation._id ? { ...c, variation_Status: newStatus } : c
            );
            setvariationData(updatedVariationData);
        } catch (error) {
            console.log(error);
        }
    };

    const handleFilter = () => {
        const filteredvariationList = variationData?.filter((variation) => {
            const formattedvariationName = (variation?.name || "").toUpperCase().replace(/\s/g, "");
            let isvariationName = true;
            if (variationName) {
                isvariationName = formattedvariationName.includes(variationName.toUpperCase().replace(/\s/g, ""));
            }

            return isvariationName;
        });

        // Apply search query filtering
        const filteredData = filteredvariationList?.filter((variation) => {
            const formattedSearchQuery = searchQuery.toUpperCase().replace(/\s/g, "");
            const rowValues = Object.values(variation);
            for (let i = 0; i < rowValues.length; i++) {
                const formattedRowValue = String(rowValues[i]).toUpperCase().replace(/\s/g, "");
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

    // for add variation

    const productId = selectedVariationData?._id

    return (
        <>
            <div className="main-content">
                <div className="page-content">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-2 table-heading">
                                Color Variation List
                            </div>
                            <div className="d-flex flex-wrap gap-2 mt-2">
                                <button onClick={() => handleOpenAddVariationModel()} className="btn btn-primary waves-effect waves-light">
                                    Add Variation <i className="fas fa-arrow-right ms-2"></i>
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
                                    <ClearIcon className="cancelSearch" onClick={() => setSearchQuery("")} />
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
                                                <div>{selectedRows.length} Variation selected</div>
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
                <EditVariation
                    handleCloseModal={handleCloseModal}
                    selectedVariation={selectedVariation}
                    handleVariationUpdate={handleVariationUpdate}
                />
            </Modal>
            <Modal
                className="main-content dark"
                isOpen={variationAddModel}
                onRequestClose={handleCloseAddVariationModel}
            >
                <AddVariationByTable
                    handleCloseModal={handleCloseAddVariationModel}
                    variations={variations}
                    setVariations={setVariations}
                    productId={productId}
                />
            </Modal>

            <Modal
                className="main-content dark"
                isOpen={isModalOpenforImage}
            >

                <ImageModel
                    isOpen={isModalOpenforImage}
                    onClose={() => setIsModalOpenforImage(false)}
                    imageURL={selectedImage}
                />
            </Modal>
        </>
    );
};

export default Showvariation;
