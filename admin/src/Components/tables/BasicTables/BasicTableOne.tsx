import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import Chip from "@mui/material/Chip";
import { Box } from "@mui/material";
import { useMemo } from "react";

interface Order {
  id: number;
  user: {
    image: string;
    name: string;
    role: string;
  };
  projectName: string;
  team: {
    images: string[];
  };
  status: string;
  budget: string;
}

const tableData: Order[] = [
  {
    id: 1,
    user: {
      image: "./images/user/user-17.jpg",
      name: "Lindsey Curtis",
      role: "Web Designer",
    },
    projectName: "Agency Website",
    team: {
      images: [
        "./images/user/user-22.jpg",
        "./images/user/user-23.jpg",
        "./images/user/user-24.jpg",
      ],
    },
    budget: "3.9K",
    status: "Active",
  },
  {
    id: 2,
    user: {
      image: "./images/user/user-18.jpg",
      name: "Kaiya George",
      role: "Project Manager",
    },
    projectName: "Technology",
    team: {
      images: ["./images/user/user-25.jpg", "./images/user/user-26.jpg"],
    },
    budget: "24.9K",
    status: "Pending",
  },
  {
    id: 3,
    user: {
      image: "./images/user/user-17.jpg",
      name: "Zain Geidt",
      role: "Content Writing",
    },
    projectName: "Blog Writing",
    team: {
      images: ["./images/user/user-27.jpg"],
    },
    budget: "12.7K",
    status: "Active",
  },
  {
    id: 4,
    user: {
      image: "./images/user/user-20.jpg",
      name: "Abram Schleifer",
      role: "Digital Marketer",
    },
    projectName: "Social Media",
    team: {
      images: [
        "./images/user/user-28.jpg",
        "./images/user/user-29.jpg",
        "./images/user/user-30.jpg",
      ],
    },
    budget: "2.8K",
    status: "Cancel",
  },
  {
    id: 5,
    user: {
      image: "./images/user/user-21.jpg",
      name: "Carla George",
      role: "Front-end Developer",
    },
    projectName: "Website",
    team: {
      images: [
        "./images/user/user-31.jpg",
        "./images/user/user-32.jpg",
        "./images/user/user-33.jpg",
      ],
    },
    budget: "4.5K",
    status: "Active",
  },
];

export default function BasicTableOne() {
  const columns: GridColDef[] = useMemo(() => [
    {
      field: "user",
      headerName: "User",
      flex: 1.5,
      align: "left",
      headerAlign: "left",
      renderCell: (params) => {
        const user = params.value;
        return (
          <Box display="flex" alignItems="center" height="100%" width="100%" gap={1.5}>
            <Avatar src={user.image} alt={user.name} />
            <Box>
              <div className="text-sm font-medium text-gray-800 dark:text-white/90">{user.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{user.role}</div>
            </Box>
          </Box>
        );
      },
    },
    {
      field: "projectName",
      headerName: "Project Name",
      flex: 1,
      align: "left",
      headerAlign: "left",
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%" width="100%" py={2}>
          <span className="text-sm text-gray-700 dark:text-gray-400">{params.value}</span>
        </Box>
      ),
    },
    {
      field: "team",
      headerName: "Team",
      flex: 1,
      align: "left",
      headerAlign: "left",
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%" width="100%" py={2}>
          <AvatarGroup max={4}>
            {params.value.images.map((img: string, idx: number) => (
              <Avatar key={idx} src={img} sx={{ width: 24, height: 24 }} />
            ))}
          </AvatarGroup>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      align: "left",
      headerAlign: "left",
      renderCell: (params) => {
        const value = params.value;
        let color: "success" | "warning" | "error" = "success";
        if (value === "Pending") color = "warning";
        else if (value === "Cancel") color = "error";
        return (
          <Box display="flex" alignItems="center" height="100%" width="100%" py={2}>
            <Chip label={value} color={color} size="small" />
          </Box>
        );
      },
    },
    {
      field: "budget",
      headerName: "Budget",
      flex: 1,
      align: "left",
      headerAlign: "left",
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%" width="100%" py={2}>
          <span className="text-sm text-gray-700 dark:text-gray-400">{params.value}</span>
        </Box>
      ),
    },
  ], []);


  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-2">
      <DataGrid
        rows={tableData}
        columns={columns}
        getRowHeight={() => 60}
        // pageSize={5}
        // rowsPerPageOptions={[5, 10]}
        autoHeight
        disableRowSelectionOnClick
        className="text-sm [&_.MuiDataGrid-columnHeaders]:bg-gray-50 dark:[&_.MuiDataGrid-columnHeaders]:bg-white/[0.03]"
        sx={{
          border: "none",
          ".MuiDataGrid-cell": {
            borderBottom: "1px solid rgba(0,0,0,0.05)",
          },
          ".MuiDataGrid-columnHeaderTitle": {
            fontWeight: 500,
            fontSize: "12px",
            color: "#6B7280",
          },
        }}
      />
    </div>
  );
}
