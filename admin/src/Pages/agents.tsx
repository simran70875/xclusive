import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { Box, IconButton, Switch, Tooltip } from "@mui/material";
import { Edit2, Key, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import Label from "../components/form/Label";
import Input from "../components/form/input/InputField";
import Button from "../components/ui/button/Button";
import PhoneInput from "../components/form/group-input/PhoneInput";
import { EnvelopeIcon } from "../icons";
import DataTable from "../components/common/DataTable";
import ConfirmModal from "../components/common/ConfirmModal";
import CommonModal from "../components/common/CommonModal";
import { User } from "../types/auth";
import { useAxios } from "../hooks/useAxios";
import { API_PATHS, IMAGE_URL } from "../utils/config";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import DropzoneComponent from "../components/form/form-elements/DropZone";

const countries = [
    { code: "IN", label: "+91" },
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" },
];

interface addUserData {
    userId: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    address: string,
    password: string,
    confirmPassword: string,
}

export default function AgentsPage() {
    const [searchQuery, setSearchQuery] = useState("");

    // Modal states
    const [editAgent, setEditAgent] = useState<User | null>(null);
    const [deleteAgent, setDeleteAgent] = useState<User | null>(null);
    const [statusChangeAgent, setStatusChangeAgent] = useState<User | null>(null);
    const [addAgentModalOpen, setAddAgentModalOpen] = useState(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleDrop = (files: File[]) => {
        const file = files[0];

        if (!file) return;
        setSelectedFile(file);
    };

    const [changePasswordAgent, setChangePasswordAgent] = useState<User | null>(null);
    const [passwordForm, setPasswordForm] = useState({
        password: "",
        confirmPassword: ""
    });

    const handlePasswordInputChange = (field: string, value: string) => {
        setPasswordForm(prev => ({ ...prev, [field]: value }));
    };

    // Form state for editing & adding
    const [formData, setFormData] = useState<addUserData>({
        userId: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        confirmPassword: "",
    });

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



    //get all agents
    const {
        data: agentData,
        loading,
        // error,
        refetch,
        metaData,
    } = useAxios<User[]>({
        url: `${API_PATHS.AGENTS}?${query}`,
        method: "get",
    });


    const { adminToken } = useAuth();

    // Add Agent
    const {
        loading: addLoading,
        // error: addError,
        refetch: addAgentRequest,
    } = useAxios({
        url: API_PATHS.ADD_AGENT,
        method: "post",
        manual: true,
        config: {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            Authorization: adminToken ? `Bearer ${adminToken}` : "",
        },
    });

    // Edit Agent
    const {
        // loading: editLoading,
        // error: editError,
        refetch: editAgentRequest,
    } = useAxios({
        url: editAgent ? `${API_PATHS.EDIT_AGENT}/${editAgent.userId}` : "",
        method: "put",
        body: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
        },
        manual: true,
    });

    // Change Password
    const {
        refetch: changePasswordRequest,
        error: editError,
    } = useAxios({
        url: changePasswordAgent ? `${API_PATHS.EDIT_AGENT}/${changePasswordAgent.userId}/password` : "",
        method: "put",
        body: { newPassword: passwordForm.password },
        manual: true,
    });


    // Delete Agent
    const {
        refetch: deleteAgentRequest,
    } = useAxios({
        url: deleteAgent ? `${API_PATHS.DELETE_AGENT}/${deleteAgent.userId}` : "",
        method: "delete",
        manual: true,
    });

    // Change Status
    const {
        refetch: statusChangeRequest,
    } = useAxios({
        url: statusChangeAgent ? `${API_PATHS.EDIT_AGENT}/${statusChangeAgent.userId}/status` : "",
        method: "put",
        body: { isActive: !statusChangeAgent?.isActive },
        manual: true,
    });


    const handlePasswordChange = async () => {
        const { password, confirmPassword } = passwordForm;

        if (!password || !confirmPassword) {
            toast.error("Both password fields are required");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            await changePasswordRequest();

            setChangePasswordAgent(null);
            refetch();

        } catch (err) {
            console.error("Password change error:", err);
            toast.error("Failed to update password");
        }
    };


    const handleAddAgent = async () => {
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        if (!selectedFile) {
            toast.error("Signature image is required");
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append("userId", formData.userId);
        formDataToSend.append("firstName", formData.firstName);
        formDataToSend.append("lastName", formData.lastName);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("phone", formData.phone);
        formDataToSend.append("address", formData.address);
        formDataToSend.append("password", formData.password);
        formDataToSend.append("confirmPassword", formData.confirmPassword);

        formDataToSend.append("image", selectedFile);

        await addAgentRequest({ body: formDataToSend });

        if (!addLoading) {
            setAddAgentModalOpen(false);
            refetch(); // refresh agent list
        }
    };

    const handleSaveEdit = async () => {
        if (!editAgent) return;

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        try {
            await editAgentRequest();

            setEditAgent(null);
            refetch();
        } catch (err) {
            alert(editError?.message || "Failed to update agent");
        }
    };

    const handleDeleteAgent = async () => {
        try {
            await deleteAgentRequest();
            setDeleteAgent(null);
            refetch();
        } catch (err) {
            alert("Failed to delete agent");
        }
    };

    const handleStatusChange = async () => {
        if (!statusChangeAgent) return;

        try {
            await statusChangeRequest(); // uses URL/body from state
            setStatusChangeAgent(null);
            refetch(); // refresh table
        } catch (err) {
            alert("Failed to change status");
        }
    };

    // Open edit modal & fill form
    const openEditModal = (agent: User) => {
        setEditAgent(agent);
        setFormData({
            userId: agent.userId,
            firstName: agent.firstName,
            lastName: agent.lastName,
            email: agent.email,
            phone: String(agent.phone),
            address: agent.address,
            password: "",
            confirmPassword: "",
        });
    };

    // Open add modal and reset form
    const openAddModal = () => {
        setAddAgentModalOpen(true);
        setFormData({
            userId: "",
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            password: "",
            confirmPassword: "",
        });
    };

    // Handle form changes
    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const columns: GridColDef[] = useMemo(
        () => [
            {
                field: "avatar",
                headerName: "Avatar",
                width: 80,
                renderCell: (params) => (
                    <>
                        <div className="w-[32px] h-[32px] rounded-full bg-yellow-200 uppercase flex items-center justify-center">
                            {params.row.firstName[0]} {params.row.lastName[0]}
                        </div>
                    </>

                ),
                sortable: false,
                filterable: false,
            },
            {
                field: "signature",
                headerName: "Signature",
                width: 300,
                renderCell: (params) => (
                    <>
                        <div>
                            <img
                                src={IMAGE_URL + "/" + params.row.signature}
                                alt="Preview"
                                style={{
                                    width: "100%",
                                    maxHeight: "500px",
                                    objectFit: "contain",
                                }}
                            />{" "}
                        </div>
                    </>
                ),
                sortable: false,
                filterable: false,
            },
            {
                field: "userId",
                headerName: "Agent Id",
                flex: 1,

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
                field: "isActive",
                headerName: "Status",
                width: 100,
                renderCell: (params) => (
                    <Switch
                        checked={params.value}
                        onChange={() => setStatusChangeAgent(params.row)}
                        size="small"
                    />
                ),
            },

            {
                field: "actions",
                headerName: "Actions",
                width: 160,
                renderCell: (params) => (
                    <Box display="flex" gap={1}>
                        <Tooltip title="Edit">
                            <IconButton
                                color="primary"
                                size="small"
                                onClick={() => openEditModal(params.row)}
                            >
                                <Edit2 size={16} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton
                                color="error"
                                size="small"
                                onClick={() => setDeleteAgent(params.row)}
                            >
                                <Trash2 size={16} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Change Password">
                            <IconButton
                                color="secondary"
                                size="small"
                                onClick={() => {
                                    setChangePasswordAgent(params.row);
                                    setPasswordForm({ password: "", confirmPassword: "" });
                                }}

                            >
                                <Key size={16} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                ),
                sortable: false,
                filterable: false,
            },
        ],
        [agentData]
    );

    return (
        <div className="space-y-4">
            {/* Title + Search + Add Button */}
            <div className="flex justify-between items-center ">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Manage Agents</h2>

                <div className="flex gap-3 items-center">
                    <div>
                        <Input
                            name="search"
                            type="search"
                            placeholder="Search agents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="primary" size="sm" onClick={openAddModal}>
                        Add New Agent
                    </Button>
                </div>
            </div>

            <DataTable
                rows={agentData || []}
                rowCount={metaData?.total || 0}
                pagination
                paginationMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={(model) => setPaginationModel(model)}
                loading={loading}
                columns={columns}
                getRowId={(row: any) => row._id}
            />


            {/* Edit Agent Modal */}
            <CommonModal open={!!editAgent} onClose={() => setEditAgent(null)} title="Edit Agent" width="medium">
                <div className="space-y-6">
                    {/* Row 1 */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <Label>First Name</Label>
                            <Input
                                value={formData.firstName}
                                onChange={(e: any) => handleInputChange("firstName", e.target.value)}
                                placeholder="firstName"
                            />
                        </div>
                        <div>
                            <Label>Last Name</Label>
                            <Input
                                value={formData.lastName}
                                onChange={(e: any) => handleInputChange("lastName", e.target.value)}
                                placeholder="lastName"
                            />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    className="pl-[62px]"
                                    value={formData.email}
                                    onChange={(e: any) => handleInputChange("email", e.target.value)}
                                    placeholder="Email"
                                />
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                    <EnvelopeIcon className="size-6" />
                                </span>
                            </div>
                        </div>
                        <div>
                            <Label>Mobile</Label>
                            <PhoneInput
                                selectPosition="start"
                                countries={countries}
                                placeholder="+1 (555) 000-0000"
                                onChange={(val: any) => handleInputChange("phone", val)}
                            // value={formData.phone}
                            />
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="flex gap-6">

                        <div className="w-full">
                            <Label>Address</Label>
                            <Input
                                value={formData.address}
                                onChange={(e: any) => handleInputChange("address", e.target.value)}
                                placeholder="Address"
                            />
                        </div>
                    </div>



                    {/* Buttons */}
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" size="sm" onClick={() => setEditAgent(null)}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                            Save
                        </Button>
                    </div>
                </div>
            </CommonModal>

            {/* Add New Agent Modal */}
            <CommonModal open={addAgentModalOpen} onClose={() => setAddAgentModalOpen(false)} title="Add New Agent" width="medium">
                <div className="grid grid-cols-2 gap-6">

                    {/* First Name */}
                    {/* <div>
                        <Label>Agent Id</Label>
                        <Input
                            value={formData.userId}
                            onChange={(e: any) => handleInputChange("userId", e.target.value)}
                            placeholder="Add unique agent id"
                        />
                    </div> */}

                    {/* First Name */}
                    <div>
                        <Label>First Name</Label>
                        <Input
                            value={formData.firstName}
                            onChange={(e: any) => handleInputChange("firstName", e.target.value)}
                            placeholder="First Name"
                        />
                    </div>

                    {/* Last Name */}
                    <div>
                        <Label>Last Name</Label>
                        <Input
                            value={formData.lastName}
                            onChange={(e: any) => handleInputChange("lastName", e.target.value)}
                            placeholder="Last Name"
                        />
                    </div>



                    {/* Email */}
                    <div>
                        <Label>Email</Label>
                        <div className="relative">
                            <Input
                                type="text"
                                className="pl-[62px]"
                                value={formData.email}
                                onChange={(e: any) => handleInputChange("email", e.target.value)}
                                placeholder="Email"
                            />
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                <EnvelopeIcon className="size-6" />
                            </span>
                        </div>
                    </div>

                    {/* Mobile */}
                    <div>
                        <Label>Mobile</Label>
                        <PhoneInput
                            selectPosition="start"
                            countries={countries}
                            placeholder="+1 (555) 000-0000"
                            // value={formData.phone}
                            onChange={(val) => handleInputChange("phone", val)}
                        />

                    </div>

                    {/* Address */}
                    <div>
                        <Label>Address</Label>
                        <Input
                            value={formData.address}
                            onChange={(e: any) => handleInputChange("address", e.target.value)}
                            placeholder="Address"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <Label>Password</Label>
                        <Input
                            type="password"
                            value={formData.password}
                            onChange={(e: any) => handleInputChange("password", e.target.value)}
                            placeholder="Password"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <Label>Confirm Password</Label>
                        <Input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e: any) => handleInputChange("confirmPassword", e.target.value)}
                            placeholder="Confirm Password"
                        />
                    </div>


                    <div className="col-span-2 mt-4">
                        <Label>Signature Image</Label>
                        <DropzoneComponent
                            onDrop={handleDrop}
                            accept={{
                                "image/*": [".jpg", ".jpeg", ".png"],
                            }}
                            label="Upload Signature Image"
                            //   helperText="Only .jpg, .jpeg, or .png files are supported and Image must be at least 2000x584 pixels"
                            previewFile={selectedFile}
                        />
                    </div>


                    {/* Action Buttons (span 2 columns) */}
                    <div className="col-span-2 flex justify-end gap-3 mt-4">
                     
                        {addLoading ? (
                            "adding..."
                        ) : (
                            <div className="col-span-2 flex justify-end gap-3 mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setAddAgentModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={addLoading}
                                    variant="primary"
                                    size="sm"
                                    onClick={handleAddAgent}
                                >
                                    Add
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CommonModal>


            {/* reset password */}
            <CommonModal
                open={!!changePasswordAgent}
                onClose={() => setChangePasswordAgent(null)}
                title={`Change Password for ${changePasswordAgent?.firstName}`}
                width="small"
            >
                <div className="space-y-4">
                    <div>
                        <Label>New Password</Label>
                        <Input
                            type="password"
                            value={passwordForm.password}
                            onChange={(e) => handlePasswordInputChange("password", e.target.value)}
                            placeholder="Enter new password"
                        />
                    </div>
                    <div>
                        <Label>Confirm Password</Label>
                        <Input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => handlePasswordInputChange("confirmPassword", e.target.value)}
                            placeholder="Re-enter new password"
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" size="sm" onClick={() => setChangePasswordAgent(null)}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="sm" onClick={handlePasswordChange}>
                            Save
                        </Button>
                    </div>
                </div>
            </CommonModal>


            {/* Confirm Delete Modal */}
            <ConfirmModal
                open={!!deleteAgent}
                onClose={() => setDeleteAgent(null)}
                onConfirm={handleDeleteAgent}
                title="Confirm Delete Agent"
                description={`Are you sure you want to delete agent ${deleteAgent?.firstName}?`}
            />

            <ConfirmModal
                open={!!statusChangeAgent}
                onClose={() => setStatusChangeAgent(null)}
                onConfirm={handleStatusChange}
                title="Confirm Status Change"
                description={
                    <>
                        Are you sure you want to{" "}
                        <strong>{statusChangeAgent?.isActive ? "deactivate" : "activate"}</strong> agent{" "}
                        <strong>{statusChangeAgent?.firstName}</strong>?
                    </>
                }
            />


        </div>
    );
}
