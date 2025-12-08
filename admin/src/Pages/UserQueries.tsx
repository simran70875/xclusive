import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Tooltip, DialogActions, Typography } from "@mui/material";
import { Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import Input from "../components/form/input/InputField";
import DataTable from "../components/common/DataTable";
import ConfirmModal from "../components/common/ConfirmModal";
import moment from "moment";
import { UserQuery } from "../types/auth";
import { useAxios } from "../hooks/useAxios";
import { API_PATHS, IMAGE_URL } from "../utils/config";
import Button from "../components/ui/button/Button";


export default function QueriesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteQuery, setDeleteQuery] = useState<UserQuery | null>(null);

    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        pageSize: 20,
        page: 0,
    });

    // Build query string for API
    const query = new URLSearchParams({
        search: searchQuery,
        page: (paginationModel.page + 1).toString(),
        limit: paginationModel.pageSize.toString(),
    }).toString();

    //get all querys
    const {
        data: queriesData,
        loading,
        // error,
        refetch,
        metaData,
    } = useAxios<UserQuery[]>({
        url: `${API_PATHS.QUERIES}?${query}`,
        method: "get",
    });

    // Delete Query
    const {
        refetch: deletequeryRequest,
    } = useAxios({
        url: deleteQuery ? `${API_PATHS.QUERIES}/${deleteQuery._id}` : "",
        method: "delete",
        manual: true,
    });

    const handleDeletequery = async () => {
        try {
            await deletequeryRequest();
            setDeleteQuery(null);
            refetch();
        } catch (err) {
            alert("Failed to delete query");
        }
    };


    const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
    const [isImage, setIsImage] = useState<boolean>(false);

    const handlePreviewDocument = (url: string, isImageType: boolean) => {
        setPreviewFileUrl(url);
        setIsImage(isImageType);
    };

    const columns: GridColDef[] = useMemo(
        () => [
            {
                field: "avatar",
                headerName: "Avatar",
                width: 80,
                renderCell: (params) => (
                    <>
                        <div className="w-[32px] h-[32px] rounded-full bg-pink-200 uppercase flex items-center justify-center">
                            {params.row.firstName[0]} {params.row.lastName[0]}
                        </div>
                    </>

                ),
                sortable: false,
                filterable: false,
            },
            {
                field: "createdAt",
                headerName: "Submitted At",
                flex: 1,
                renderCell: (params) => (
                    <div className="text-sm text-gray-800 dark:text-white/90">  {moment(params.row.createdAt).format("DD MMM YYYY")}</div>
                ),
            },

            {
                field: "firstName",
                headerName: "Name",
                flex: 1,
                renderCell: (params) => (
                    <div className="text-sm text-gray-800 dark:text-white/90">{params.row.firstName} {params.row.lastName}</div>
                ),
            },
            {
                field: "phone",
                headerName: "Mobile",
                flex: 1,
                renderCell: (params) => (
                    <span className="text-sm text-gray-700 dark:text-gray-400">{params.value}</span>
                ),
            },
            {
                field: "email",
                headerName: "Email",
                flex: 1.5,
                renderCell: (params) => (
                    <span className="text-sm text-gray-700 dark:text-gray-400">{params.value}</span>
                ),
            },
            {
                field: "address",
                headerName: "Address",
                flex: 1.5,
                renderCell: (params) => (
                    <span className="text-sm text-gray-700 dark:text-gray-400">{params.value}</span>
                ),
            },
            {
                field: "company",
                headerName: "Company",
                flex: 1.5,
            },
            {
                field: "message",
                headerName: "Message",
                flex: 1.5,
            },
            {
                field: "consent",
                headerName: "Privacy Consent",
                flex: 1.5,
            },
            {
                field: "subscribe",
                headerName: "Promotional Consent",
                flex: 1.5,
            },
            {
                field: "document",
                headerName: "Document",
                flex: 1,
                renderCell: (params) => {
                    const fileUrl = IMAGE_URL + params.value;
                    const ext = params.value?.split('.').pop().toLowerCase();

                    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);

                    return (

                        <>
                            {!params.value ? <></> : <button
                                className="text-sm text-blue-500 underline"
                                onClick={() => handlePreviewDocument(fileUrl, isImage)}
                            >
                                {isImage ? "View Image" : "Download File"}
                            </button>}
                        </>

                    );
                }
            },

            {
                field: "actions",
                headerName: "Actions",
                width: 160,
                renderCell: (params) => (
                    <Box display="flex" gap={1}>

                        <Tooltip title="Delete">
                            <IconButton
                                color="error"
                                size="small"
                                onClick={() => setDeleteQuery(params.row)}
                            >
                                <Trash2 size={16} />
                            </IconButton>
                        </Tooltip>

                    </Box>
                ),
                sortable: false,
                filterable: false,
            },
        ],
        [queriesData]
    );

    return (
        <div className="space-y-4">
            {/* Title + Search + Add Button */}
            <div className="flex justify-between items-center ">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Manage Queries</h2>


                <div>
                    <Input
                        name="search"
                        type="search"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>


            </div>

            <DataTable
                rows={queriesData || []}
                rowCount={metaData?.total || 0}
                pagination
                paginationMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={(model) => setPaginationModel(model)}
                loading={loading}
                columns={columns}
                getRowId={(row: any) => row._id}
            />


            <Dialog open={!!previewFileUrl} onClose={() => setPreviewFileUrl(null)} maxWidth="md" fullWidth>
                <DialogTitle>Document Preview</DialogTitle>
                <DialogContent dividers>
                    {isImage ? (
                        <img
                            src={previewFileUrl ?? ""}
                            alt="Preview"
                            style={{ width: "100%", maxHeight: "500px", objectFit: "contain" }}
                        />
                    ) : (
                        <Typography variant="body1">
                            This file can't be previewed.{" "}
                            <a
                                href={previewFileUrl ?? "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "#1976d2", textDecoration: "underline" }}
                            >
                                Download File
                            </a>
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewFileUrl(null)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>



            {/* Confirm Delete Modal */}
            <ConfirmModal
                open={!!deleteQuery}
                onClose={() => setDeleteQuery(null)}
                onConfirm={handleDeletequery}
                title="Confirm Delete Query"
                description={`Are you sure you want to delete query ${deleteQuery?.firstName}?`}
            />




        </div>
    );
}
