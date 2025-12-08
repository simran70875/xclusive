import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { Avatar, Box, IconButton, Switch, Tooltip } from "@mui/material";
import { Edit2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import Label from "../components/form/Label";
import Input from "../components/form/input/InputField";
import Button from "../components/ui/button/Button";
import CommonModal from "../components/common/CommonModal";
import ConfirmModal from "../components/common/ConfirmModal";
import DataTable from "../components/common/DataTable";
import DropzoneComponent from "../components/form/form-elements/DropZone";
import { useNavigate } from "react-router";
import { API_PATHS } from "../utils/config";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useAxios } from "../hooks/useAxios";
import UploadingProgress from "../components/ui/UploadingProgress";
import toast from "react-hot-toast";
import { Product } from "../types/product";
import { useProductList } from "../hooks/useProductList";

export default function ProductManagement() {
    const navigate = useNavigate();
    const { adminToken } = useAuth();

    const [searchQuery, setSearchQuery] = useState("");

    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        pageSize: 50,
        page: 0,
    });

    const { productData, refetch, metaData } = useProductList({
        searchQuery,
        paginationModel,
    });

    // Modal state
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
    const [statusChangeProduct, setStatusChangeProduct] = useState<Product | null>(null);
    const [markTopProduct, setMarkTopProduct] = useState<Product | null>(null);
    const [csvModalOpen, setCsvModalOpen] = useState(false);


    // ========================================> handle edit
    // Form state
    const [formData, setFormData] = useState<Omit<Product, "_id" | "isActive">>({
        Code: "",
        Description: "",
        Pack: 0,
        rrp: 0,
        GrpSupplier: "",
        GrpSupplierCode: "",
        Manufacturer: "",
        ManufacturerCode: "",
        ISPCCombined: 0,
        VATCode: 0,
        Brand: "",
        ExtendedCharacterDesc: "",
        CatalogueCopy: "",
        ImageRef: "",
        Category1: "",
        Category2: "",
        Category3: "",
        Style: "",
    });


    const handleInputChange = (field: keyof typeof formData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };
    const handleSaveEdit = () => {
        if (!editProduct) return;
        setEditProduct(null);
    };

    // ========================================> handle delete

    const {
        refetch: deleteProductById,
    } = useAxios({
        url: deleteProduct ? `${API_PATHS.PRODUCT_DELETE}/${deleteProduct._id}` : "",
        method: "delete",
        manual: true,
    });


    const handleDelete = async () => {
        await deleteProductById();
        refetch();
        setDeleteProduct(null);
    };

    // ========================================> update visisbility

    const handleToggleStatusRequest = (product: Product) => {
        setStatusChangeProduct(product);
    };

    // Change Status
    const {
        refetch: statusChangeRequest,
    } = useAxios({
        url: statusChangeProduct ? `${API_PATHS.PRODUCT_VISIBILITY}/${statusChangeProduct._id}` : "",
        method: "put",
        body: { isActive: !statusChangeProduct?.isActive },
        manual: true,
    });

    const handleConfirmStatusChange = async () => {
        if (!statusChangeProduct) return;

        try {
            await statusChangeRequest(); // Wait for PUT request to complete
            refetch();                   // Then refetch product list
        } catch (error) {
            console.error("Status change failed:", error);
            toast.error("Failed to update status");
        } finally {
            setStatusChangeProduct(null); // Always close modal
        }
    };

    // Mark Top Selling
    const { refetch: markTopSellingRequest } = useAxios({
        url: markTopProduct ? `${API_PATHS.MARK_TOP_PRODUCT}/${markTopProduct._id}` : "",
        method: "put",
        body: { topSelling: !markTopProduct?.topSelling },
        manual: true,
    });

    const handleConfirmTopProductChange = async () => {
        if (!markTopProduct) return;

        await markTopSellingRequest(); // Wait for PUT request to complete
        refetch(); // Then refetch product list
        setMarkTopProduct(null);
    };

    const productColumns: GridColDef[] = useMemo(
        () => [
            {
                field: "ImageRef",
                headerName: "Image",
                width: 80,
                renderCell: (params) => (
                    <Avatar
                        src={params.value}
                        alt={params.row.Code}
                        variant="square"
                        sx={{ width: 48, height: 48 }}
                    />
                ),
                sortable: false,
                filterable: false,
            },
            { field: "ISPCCombined", headerName: "ISPC", width: 100, type: "number" },
            { field: "Code", headerName: "Code", width: 120 },
            { field: "Style", headerName: "Style", width: 120 },
            { field: "Description", headerName: "Product", width: 180 },
            {
                field: "Brand", headerName: "Brand", width: 120, renderCell: (params) => (
                    <>
                        {params.row.Brand?.Brand || ""}

                    </>
                ),
            },
            // {
            //     field: "CatalogueCopy", headerName: "Description", width: 350, renderCell: (params) => (
            //         <div
            //             style={{
            //                 paddingLeft: "1rem",
            //             }}
            //             dangerouslySetInnerHTML={{ __html: params.row.CatalogueCopy || "" }}

            //         ></div>
            //     ),
            // },
            {
                field: "Category1",
                headerName: "Category 1",
                width: 180,
                renderCell: (params) => (
                    <>
                        {params.row.Category1?.Category1 || ""}

                    </>
                ),
            },
            {
                field: "Category2", headerName: "Category 2", width: 120, renderCell: (params) => (
                    <>
                        {params.row.Category2?.Category2 || ""}

                    </>
                ),
            },
            {
                field: "Category3", headerName: "Category 3", width: 120, renderCell: (params) => (
                    <>
                        {params.row.Category3?.Category3 || ""}

                    </>
                ),
            },
            {
                field: "isActive",
                headerName: "Status",
                align: "center",
                headerAlign: "center",
                width: 100,
                renderCell: (params) => (
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        height="100%"
                        width="100%"
                    >
                        <Switch
                            checked={params.value}
                            onChange={() => handleToggleStatusRequest(params.row)}
                            size="small"
                        />
                    </Box>
                ),
            },
            {
                field: "topSelling",
                headerName: "Mark Top Selling",
                align: "center",
                headerAlign: "center",
                width: 100,
                renderCell: (params) => (
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        height="100%"
                        width="100%"
                    >
                        <Switch
                            checked={params.value}
                            onChange={() => {
                                setMarkTopProduct(params.row);
                            }}
                            size="small"
                        />
                    </Box>
                ),
            },
            {
                field: "actions",
                headerName: "Actions",
                width: 120,
                align: "center",
                headerAlign: "center",
                renderCell: (params) => (
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        height="100%"
                        width="100%"
                    >
                        <Tooltip title="Edit">
                            <IconButton
                                color="primary"
                                size="small"
                                onClick={() => navigate("/editProduct", { state: { productId: params.row._id } })}

                            >
                                <Edit2 size={16} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton
                                color="error"
                                size="small"
                                onClick={() => setDeleteProduct(params.row)}
                            >
                                <Trash2 size={16} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                ),
                sortable: false,
                filterable: false,
                cellClassName: "actions-column-sticky", // add this class
                headerClassName: "actions-column-sticky",
            },
        ],
        [productData]
    );

    // ========================================> upload csv

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [error, setError] = useState<string | null>(null);

    const handleDrop = (files: File[]) => {
        const file = files[0];
        console.log("file uploaded ==> ", file);
        if (!file) return;
        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            setLoading(true);
            setError(null);
            setUploadProgress(0);


            await axios.post(API_PATHS.UPLOAD_PRODUCTS_CSV, formData, {
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    const total = progressEvent.total ?? 1; // fallback to avoid division by zero
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
                    setUploadProgress(percentCompleted);
                }
            });

            setCsvModalOpen(false);
            setSelectedFile(null);
            refetch();
            toast.success("Upload successful");

        } catch (err: any) {
            console.error("Upload failed:", err);
            setError(err.response?.data?.message || "Upload failed");
            // toast.error("Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Manage Products
                </h2>
                <div className="flex items-center gap-3">
                    <div>
                        <Input
                            name="search"
                            type="search"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                            navigate("/addProduct")
                        }}
                    >
                        Add New Product
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => setCsvModalOpen(true)}>
                        Upload CSV
                    </Button>
                </div>
            </div>

            <DataTable
                rows={productData || []}
                rowCount={metaData?.total || 0}
                pagination
                paginationMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={(model) => setPaginationModel(model)}
                loading={loading}
                columns={productColumns}
                getRowId={(row: any) => row._id}
            />


            {/* Edit Product Modal */}
            <CommonModal
                open={!!editProduct}
                onClose={() => setEditProduct(null)}
                title="Edit Product"
                width="large"
            >
                <div className="space-y-4 max-h-[70vh] overflow-auto">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label>Code *</Label>
                            <Input
                                value={formData.Code}
                                onChange={(e) => handleInputChange("Code", e.target.value)}
                                placeholder="Code"

                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input
                                value={formData.Description}
                                onChange={(e) => handleInputChange("Description", e.target.value)}
                                placeholder="Description"
                            />
                        </div>
                        <div>
                            <Label>Pack</Label>
                            <Input
                                type="number"
                                value={formData.Pack}
                                onChange={(e) =>
                                    handleInputChange("Pack", Number(e.target.value))
                                }
                                placeholder="Pack"
                            />
                        </div>
                        <div>
                            <Label>RRP</Label>
                            <Input
                                type="number"
                                value={formData.rrp}
                                onChange={(e) => handleInputChange("rrp", Number(e.target.value))}
                                placeholder="RRP"
                            />
                        </div>
                        <div>
                            <Label>Supplier</Label>
                            <Input
                                value={formData.GrpSupplier}
                                onChange={(e) => handleInputChange("GrpSupplier", e.target.value)}
                                placeholder="Supplier"
                            />
                        </div>
                        <div>
                            <Label>Supplier Code</Label>
                            <Input
                                value={formData.GrpSupplierCode}
                                onChange={(e) => handleInputChange("GrpSupplierCode", e.target.value)}
                                placeholder="Supplier Code"
                            />
                        </div>
                        <div>
                            <Label>Manufacturer</Label>
                            <Input
                                value={formData.Manufacturer}
                                onChange={(e) => handleInputChange("Manufacturer", e.target.value)}
                                placeholder="Manufacturer"
                            />
                        </div>
                        <div>
                            <Label>Manufacturer Code</Label>
                            <Input
                                value={formData.ManufacturerCode}
                                onChange={(e) => handleInputChange("ManufacturerCode", e.target.value)}
                                placeholder="Manufacturer Code"
                            />
                        </div>
                        <div>
                            <Label>ISPC Combined</Label>
                            <Input
                                type="number"
                                value={formData.ISPCCombined}
                                onChange={(e) =>
                                    handleInputChange("ISPCCombined", Number(e.target.value))
                                }
                                placeholder="ISPC Combined"
                            />
                        </div>
                        <div>
                            <Label>VAT Code</Label>
                            <Input
                                type="number"
                                value={formData.VATCode}
                                onChange={(e) => handleInputChange("VATCode", Number(e.target.value))}
                                placeholder="VAT Code"
                            />
                        </div>
                        <div>
                            <Label>Brand</Label>
                            <Input
                                value={formData.Brand}
                                onChange={(e) => handleInputChange("Brand", e.target.value)}
                                placeholder="Brand"
                            />
                        </div>
                        <div>
                            <Label>Extended Description</Label>
                            <Input
                                value={formData.ExtendedCharacterDesc}
                                onChange={(e) =>
                                    handleInputChange("ExtendedCharacterDesc", e.target.value)
                                }
                                placeholder="Extended Description"
                            />
                        </div>
                        <div>
                            <Label>Catalogue Copy</Label>
                            <Input
                                value={formData.CatalogueCopy}
                                onChange={(e) => handleInputChange("CatalogueCopy", e.target.value)}
                                placeholder="Catalogue Copy"
                            />
                        </div>
                        <div>
                            <Label>Image Ref</Label>
                            <Input
                                value={formData.ImageRef}
                                onChange={(e) => handleInputChange("ImageRef", e.target.value)}
                                placeholder="Image URL"
                            />
                        </div>
                        <div>
                            <Label>Category 1</Label>
                            <Input
                                value={formData.Category1}
                                onChange={(e) => handleInputChange("Category1", e.target.value)}
                                placeholder="Category 1"
                            />
                        </div>
                        <div>
                            <Label>Category 2</Label>
                            <Input
                                value={formData.Category2}
                                onChange={(e) => handleInputChange("Category2", e.target.value)}
                                placeholder="Category 2"
                            />
                        </div>
                        <div>
                            <Label>Category 3</Label>
                            <Input
                                value={formData.Category3}
                                onChange={(e) => handleInputChange("Category3", e.target.value)}
                                placeholder="Category 3"
                            />
                        </div>
                        <div>
                            <Label>Style</Label>
                            <Input
                                value={formData.Style}
                                onChange={(e) => handleInputChange("Style", e.target.value)}
                                placeholder="Style"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" size="sm" onClick={() => setEditProduct(null)}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                            Save
                        </Button>
                    </div>
                </div>
            </CommonModal>

            <CommonModal
                open={csvModalOpen}
                onClose={() => setCsvModalOpen(false)}
                title="Upload Products CSV"
                width="small"
            >


                {loading ? <UploadingProgress percentage={uploadProgress} /> : <DropzoneComponent previewFile={selectedFile} onDrop={handleDrop} helperText="Only .csv, .xls, or .xlsx files are supported" />}
                {error && <p className="text-sm text-red-500 mt-2">Upload failed: {error}</p>}

                <Button onClick={handleUpload} disabled={loading || !selectedFile}>
                    Upload Products
                </Button>
            </CommonModal>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                open={!!deleteProduct}
                onClose={() => setDeleteProduct(null)}
                onConfirm={() => deleteProduct && handleDelete()}
                title="Confirm Delete Product"
                description={`Are you sure you want to delete product ${deleteProduct?.Code}?`}
            />

            {/* Confirm Status Change Modal */}
            <ConfirmModal
                open={!!statusChangeProduct}
                onClose={() => setStatusChangeProduct(null)}
                onConfirm={handleConfirmStatusChange}
                title="Confirm Status Change"
                description={
                    <>
                        Are you sure you want to{" "}
                        <strong>{statusChangeProduct?.isActive ? "deactivate" : "activate"}</strong>{" "}
                        product <strong>{statusChangeProduct?.Code}</strong>?
                    </>
                }
            />


            {/* Confirm mamrk top Modal */}
            <ConfirmModal
                open={!!markTopProduct}
                onClose={() => setMarkTopProduct(null)}
                onConfirm={handleConfirmTopProductChange}
                title="Mark Top Selling Product"
                description={
                    <>
                        Are you sure you want to mark this product{" "}
                        <strong>{statusChangeProduct?.Code}</strong> as{" "}
                        <strong>
                            {markTopProduct?.topSelling ? "not top selling" : "top selling"}
                        </strong>{" "}
                        ?
                    </>
                }
            />
        </div>
    );
}
