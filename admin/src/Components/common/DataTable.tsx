import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { Box } from "@mui/material";

interface DataTableProps {
    rows: any[];
    columns: GridColDef[];
    paginationModel: GridPaginationModel;
    onPaginationModelChange: (model: GridPaginationModel) => void;
    getRowId?: any;
    onRowClick?: any;
    getRowClassName?: any;
    rowCount?: number;
    pagination?: boolean; // ✅ add this
    paginationMode?: 'client' | 'server'; // ✅ add this
    loading?: boolean; // optional: already being used
}
export default function DataTable({
    rows,
    columns,
    paginationModel,
    onPaginationModelChange,
    getRowId,
    onRowClick,
    getRowClassName,
    rowCount,
    // pagination = true,             // ✅ set default
    paginationMode = "client",     // ✅ set default
    loading = false                // ✅ set default
}: DataTableProps) {
    return (
        <Box
            sx={{
                height: 700,
                overflowY: "auto",
                borderRadius: 2,
                border: "1px solid #e5e7eb",
                backgroundColor: "white",
                p: 2,
            }}
            className="dark:border-white/[0.05] dark:bg-white/[0.03]"
        >
            <DataGrid
                rows={rows}
                columns={columns}
                getRowId={getRowId}
                getRowClassName={getRowClassName}
                onRowClick={onRowClick}
                pagination                 // ✅ include
                paginationMode={paginationMode}                 // ✅ include
                loading={loading}                               // ✅ include
                paginationModel={paginationModel}
                onPaginationModelChange={onPaginationModelChange}
                rowCount={rowCount}
                getRowHeight={() => "auto"}
                disableRowSelectionOnClick
                pageSizeOptions={[5, 10, 15, 20]}
                className="text-sm [&_.MuiDataGrid-columnHeaders]:bg-gray-50 dark:[&_.MuiDataGrid-columnHeaders]:bg-white/[0.03]"
                sx={{
                    border: "none",
                    backgroundColor: "transparent",
                    ".MuiDataGrid-columnHeaderTitle": {
                        fontWeight: 500,
                        fontSize: "12px",
                        color: "#6B7280",
                    },
                    ".MuiDataGrid-cell": {
                        borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                        alignItems: "flex-start",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        lineHeight: 1.5,
                        py: 1,
                    },
                }}
            />
        </Box>
    );
}

