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
import { API_PATHS } from "../utils/config";
import toast from "react-hot-toast";
import moment from "moment";
import { useCustomerList } from "../hooks/useCustomerList";

const countries = [
  { code: "IN", label: "+91" },
  { code: "US", label: "+1" },
  { code: "GB", label: "+44" },
  { code: "CA", label: "+1" },
  { code: "AU", label: "+61" },
];

interface addUserData {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
}

export default function CustomerPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [editAgent, setEditAgent] = useState<User | null>(null);
  const [deleteAgent, setDeleteAgent] = useState<User | null>(null);
  const [statusChangeAgent, setStatusChangeAgent] = useState<User | null>(null);

  const [changePasswordAgent, setChangePasswordAgent] = useState<User | null>(
    null
  );
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
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

  const { userData, refetch, metaData, loading } = useCustomerList({
    searchQuery,
    paginationModel,
  });

  // Edit User
  const {
    // loading: editLoading,
    // error: editError,
    refetch: editAgentRequest,
  } = useAxios({
    url: editAgent ? `${API_PATHS.EDIT_USER}/${editAgent.userId}` : "",
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
  const { refetch: changePasswordRequest, error: editError } = useAxios({
    url: changePasswordAgent
      ? `${API_PATHS.EDIT_USER}/${changePasswordAgent.userId}/password`
      : "",
    method: "put",
    body: { newPassword: passwordForm.password },
    manual: true,
  });

  // Delete User
  const { refetch: deleteAgentRequest } = useAxios({
    url: deleteAgent ? `${API_PATHS.DELETE_USER}/${deleteAgent.userId}` : "",
    method: "delete",
    manual: true,
  });

  // Change Status
  const { refetch: statusChangeRequest } = useAxios({
    url: statusChangeAgent
      ? `${API_PATHS.EDIT_USER}/${statusChangeAgent.userId}/status`
      : "",
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
      alert(editError?.message || "Failed to update user");
    }
  };

  const handleDeleteAgent = async () => {
    try {
      await deleteAgentRequest();
      setDeleteAgent(null);
      refetch();
    } catch (err) {
      alert("Failed to delete user");
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
  const openEditModal = (user: User) => {
    setEditAgent(user);
    setFormData({
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: String(user.phone),
      address: user.address,
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
    //   {
    //     field: "avatar",
    //     headerName: "Avatar",
    //     width: 80,
    //     renderCell: (params) => (
    //       <>
    //         <div className="w-[32px] h-[32px] rounded-full bg-pink-200 uppercase flex items-center justify-center">
    //           {params.row.firstName && params.row.lastName
    //             ? `${params.row.firstName[0]}${params.row.lastName[0]}`
    //             : "--"}
    //         </div>
    //       </>
    //     ),
    //     sortable: false,
    //     filterable: false,
    //   },
      {
        field: "createdAt",
        headerName: "createdAt",
        flex: 1.5,
        renderCell: (params) => (
          <div className="text-sm text-gray-800 dark:text-white/90">
            {moment(params.row.createdAt).format("DD MMM YYYY")}
          </div>
        ),
      },
      {
        field: "type",
        headerName: "Type",
        flex: 1,
        
      },
      {
        field: "userId",
        headerName: "User Id",
        flex: 1.5,
      },
      {
        field: "firstName",
        headerName: "Name",
        flex: 1,
        renderCell: (params) => (
          <div className="text-sm text-gray-800 dark:text-white/90">
            {params.row.firstName} {params.row.lastName}
          </div>
        ),
      },
      {
        field: "phone",
        headerName: "Mobile",
        flex: 1,
        renderCell: (params) => (
          <span className="text-sm text-gray-700 dark:text-gray-400">
            {params.value}
          </span>
        ),
      },
      {
        field: "email",
        headerName: "Email",
        flex: 1.5,
        renderCell: (params) => (
          <span className="text-sm text-gray-700 dark:text-gray-400">
            {params.value}
          </span>
        ),
      },
      {
        field: "address",
        headerName: "Address",
        flex: 1.5,
        renderCell: (params) => (
          <span className="text-sm text-gray-700 dark:text-gray-400">
            {params.value}
          </span>
        ),
      },
      {
        field: "company",
        headerName: "Company",
        flex: 1.5,
        renderCell: (params) => (
          <span className="text-sm text-gray-700 dark:text-gray-400">
            {params.value}
          </span>
        ),
      },
      {
        field: "totalOrders",
        headerName: "Total Orders",
        flex: 1,
        renderCell: (params) => (
          <span className="text-sm text-gray-700 dark:text-gray-400">
            {params.value}
          </span>
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
    [userData]
  );

  return (
    <div className="space-y-4">
      {/* Title + Search + Add Button */}
      <div className="flex justify-between items-center ">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Manage Users
        </h2>

        <div className="flex gap-3 items-center">
          <div>
            <Input
              name="search"
              type="search"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <DataTable
        rows={userData || []}
        rowCount={metaData?.total || 0}
        pagination
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={(model) => setPaginationModel(model)}
        loading={loading}
        columns={columns}
        getRowId={(row: any) => row._id}
      />

      {/* Edit User Modal */}
      <CommonModal
        open={!!editAgent}
        onClose={() => setEditAgent(null)}
        title="Edit User"
        width="medium"
      >
        <div className="space-y-6">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>First Name</Label>
              <Input
                value={formData.firstName}
                onChange={(e: any) =>
                  handleInputChange("firstName", e.target.value)
                }
                placeholder="firstName"
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={formData.lastName}
                onChange={(e: any) =>
                  handleInputChange("lastName", e.target.value)
                }
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
                  onChange={(e: any) =>
                    handleInputChange("email", e.target.value)
                  }
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
                onChange={(e: any) =>
                  handleInputChange("address", e.target.value)
                }
                placeholder="Address"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditAgent(null)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveEdit}>
              Save
            </Button>
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
              onChange={(e) =>
                handlePasswordInputChange("password", e.target.value)
              }
              placeholder="Enter new password"
            />
          </div>
          <div>
            <Label>Confirm Password</Label>
            <Input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                handlePasswordInputChange("confirmPassword", e.target.value)
              }
              placeholder="Re-enter new password"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChangePasswordAgent(null)}
            >
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
        title="Confirm Delete User"
        description={`Are you sure you want to delete user ${deleteAgent?.firstName}?`}
      />

      <ConfirmModal
        open={!!statusChangeAgent}
        onClose={() => setStatusChangeAgent(null)}
        onConfirm={handleStatusChange}
        title="Confirm Status Change"
        description={
          <>
            Are you sure you want to{" "}
            <strong>
              {statusChangeAgent?.isActive ? "deactivate" : "activate"}
            </strong>{" "}
            user <strong>{statusChangeAgent?.firstName}</strong>?
          </>
        }
      />
    </div>
  );
}
