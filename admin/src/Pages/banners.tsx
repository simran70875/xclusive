import { IconButton, Switch, Tooltip } from "@mui/material";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import Label from "../components/form/Label";
import Input from "../components/form/input/InputField";
import Button from "../components/ui/button/Button";
import ConfirmModal from "../components/common/ConfirmModal";
import CommonModal from "../components/common/CommonModal";
import { useAxios } from "../hooks/useAxios";
import { API_PATHS, IMAGE_URL } from "../utils/config";
import toast from "react-hot-toast";
import { BannerState } from "../types/banner";
import DropzoneComponent from "../components/form/form-elements/DropZone";
import { useAuth } from "../hooks/useAuth";

interface addUserData {
    title: string,
    banner: string,
}

export default function BannersPage() {
    // Modal states
    const [editBanner, setEditBanner] = useState<BannerState | null>(null);
    const [deleteBanner, setDeleteBanner] = useState<BannerState | null>(null);
    const [statusChangeBanner, setStatusChangeBanner] = useState<BannerState | null>(null);
    const [addBannerModalOpen, setAddBannerModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { adminToken } = useAuth();

    // Form state for editing & adding
    const [formData, setFormData] = useState<addUserData>({
        title: "",
        banner: "",
    });


    const handleDrop = (files: File[]) => {
        const file = files[0];

        if (!file) return;
        setSelectedFile(file);
    };


    //get all agents
    const {
        data: bannerstData,
        refetch,
    } = useAxios<BannerState[]>({
        url: API_PATHS.TOP_BANNER,
        method: "get",
    });


    // useAxios call – no body here
    const {
        refetch: addBannerRequest,
    } = useAxios({
        url: API_PATHS.ADD_BANNER,
        method: "post",
        manual: true, // very important
        config: {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            Authorization: adminToken ? `Bearer ${adminToken}` : "",
        }
    });


    // Edit banner
    const {
        refetch: editBannerRequest,
        error: editError,
    } = useAxios({
        url: editBanner ? `${API_PATHS.EDIT_BANNER}/${editBanner._id}` : "",
        method: "put",
        manual: true,
        config: {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            Authorization: adminToken ? `Bearer ${adminToken}` : "",
        }
    });

    // Delete Banner
    const {
        refetch: deleteBannerRequest,
    } = useAxios({
        url: deleteBanner ? `${API_PATHS.EDIT_BANNER}/${deleteBanner._id}` : "",
        method: "delete",
        manual: true,
    });

    // Change Status
    const {
        refetch: statusChangeRequest,
    } = useAxios({
        url: statusChangeBanner ? `${API_PATHS.EDIT_BANNER}/${statusChangeBanner._id}/status` : "",
        method: "put",
        body: { isActive: !statusChangeBanner?.isActive },
        manual: true,
    });

    const validateImageSize = (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);

            img.onload = () => {
                const isValid = img.width >= 2000 && img.height >= 584;
                resolve(isValid);
            };

            img.onerror = () => resolve(false); // Handle broken image
        });
    };

    // handler
    const handleAddBanner = async () => {
        if (!formData.title || !selectedFile) {
            toast.error("Title and banner image are required");
            return;
        }

        const isValidSize = await validateImageSize(selectedFile);
        if (!isValidSize) {
            toast.error("Image must be at least 2000x584 pixels");
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append("title", formData.title);
        formDataToSend.append("banner", selectedFile);

        await addBannerRequest({ body: formDataToSend });
        setFormData({ title: "", banner: "" });
        setSelectedFile(null);
        setAddBannerModalOpen(false);
        refetch(); // Refresh banners
    };

    const handleSaveEdit = async () => {

        const formDataToSend = new FormData();
        formDataToSend.append("title", formData.title);

        if (selectedFile) {
            formDataToSend.append("banner", selectedFile);
        }


        try {
            await editBannerRequest({ body: formDataToSend });

            setFormData({ title: "", banner: "" });
            setSelectedFile(null);
            setEditBanner(null)
            refetch();
        } catch (err) {
            alert(editError?.message || "Failed to update banner");
        }
    };

    const handleDeleteBanner = async () => {
        try {
            await deleteBannerRequest();
            setDeleteBanner(null);
            refetch();
        } catch (err) {
            alert("Failed to delete banner");
        }
    };

    const handleStatusChange = async () => {
        if (!statusChangeBanner) return;

        try {
            await statusChangeRequest(); // uses URL/body from state
            setStatusChangeBanner(null);
            refetch(); // refresh table
        } catch (err) {
            alert("Failed to change status");
        }
    };

    // Open edit modal & fill form
    const openEditModal = (banner: BannerState) => {
        setEditBanner(banner);

        setFormData({
            title: banner.title,
            banner: banner.banner,
        });

        setSelectedFile(null);
    };

    // Open add modal and reset form
    const openAddModal = () => {
        setAddBannerModalOpen(true);
        setFormData({
            title: "",
            banner: "",
        });
    };

    // Handle form changes
    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };


    return (
        <div className="space-y-4">

            {/* Title + Add Button */}
            <div className="flex justify-between items-center ">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Manage Banners</h2>
                <Button variant="primary" size="sm" onClick={openAddModal}>
                    Add New Banner
                </Button>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {bannerstData?.map((banner) => (
                    <div key={banner._id} className="relative rounded-xl overflow-hidden shadow-md group">
                        {/* Image section with hover overlay */}
                        <div className="relative w-full h-48">
                            <img
                                src={IMAGE_URL + banner.banner}
                                alt={banner.title}
                                className=" w-full h-full"
                            />
                        </div>

                        {/* Title section */}
                        <div className="bg-white p-3 text-center flex items-center justify-between">
                            <div className="flex gap-2">
                                <Tooltip title="Edit">
                                    <IconButton
                                        color="primary"
                                        size="small"
                                        onClick={() => openEditModal(banner)}
                                    >
                                        <Edit2 size={16} />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Delete">
                                    <IconButton
                                        color="error"
                                        size="small"
                                        onClick={() => setDeleteBanner(banner)}
                                    >
                                        <Trash2 size={16} />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Banner Status">
                                    <Switch
                                        checked={banner.isActive}
                                        onChange={() => setStatusChangeBanner(banner)}
                                        size="small"
                                        color="default"
                                    />
                                </Tooltip>
                            </div>
                            <h3 className="text-base font-medium text-gray-800 truncate">{banner.title}</h3>
                        </div>
                    </div>
                ))}
            </div>


            {/* Edit Banner Modal */}
            <CommonModal open={!!editBanner} onClose={() => setEditBanner(null)} title="Edit Banner" width="medium">
                <div className="space-y-6">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <Label>Title</Label>
                            <Input
                                value={formData.title}
                                onChange={(e: any) => handleInputChange("title", e.target.value)}
                                placeholder="Title"
                            />
                        </div>

                        <div>
                            <Label>Banner Image</Label>
                            <DropzoneComponent
                                onDrop={handleDrop}
                                accept={{
                                    "image/*": [".jpg", ".jpeg", ".png"],
                                }}
                                label="Upload Banner Image"
                                helperText="Only .jpg, .jpeg, or .png files are supported and Image must be at least 2000x584 pixels"
                                previewFile={selectedFile || (editBanner?.banner && IMAGE_URL + editBanner.banner)}

                            />
                        </div>

                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" size="sm" onClick={() => setEditBanner(null)}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                            Save
                        </Button>
                    </div>
                </div>
            </CommonModal>

            {/* Add New Banner Modal */}
            <CommonModal open={addBannerModalOpen} onClose={() => setAddBannerModalOpen(false)} title="Add New Banner" width="medium">
                <div>
                    <div className="mb-3">
                        <Label>Title</Label>
                        <Input
                            value={formData.title}
                            onChange={(e: any) => handleInputChange("title", e.target.value)}
                            placeholder="First Name"
                        />
                    </div>

                    {/* Last Name */}
                    <div>
                        <Label>Banner Image</Label>

                        <DropzoneComponent
                            onDrop={handleDrop}
                            accept={{
                                "image/*": [".jpg", ".jpeg", ".png"],
                            }}
                            label="Upload Banner Image"
                            helperText="Only .jpg, .jpeg, or .png files are supported and Image must be at least 2000x584 pixels"
                            previewFile={selectedFile}
                        />
                    </div>


                    {/* Action Buttons (span 2 columns) */}
                    <div className="col-span-2 flex justify-end gap-3 mt-4">
                        <Button variant="outline" size="sm" onClick={() => setAddBannerModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleAddBanner}>
                            Add
                        </Button>
                    </div>
                </div>
            </CommonModal>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                open={!!deleteBanner}
                onClose={() => setDeleteBanner(null)}
                onConfirm={handleDeleteBanner}
                title="Confirm Delete Banner"
                description={`Are you sure you want to delete banner ${deleteBanner?.title}?`}
            />

            <ConfirmModal
                open={!!statusChangeBanner}
                onClose={() => setStatusChangeBanner(null)}
                onConfirm={handleStatusChange}
                title="Confirm Status Change"
                description={
                    <>
                        Are you sure you want to{" "}
                        <strong>{statusChangeBanner?.isActive ? "deactivate" : "activate"}</strong> banner{" "}
                        <strong>{statusChangeBanner?.title}</strong>?
                    </>
                }
            />


        </div>
    );
}
