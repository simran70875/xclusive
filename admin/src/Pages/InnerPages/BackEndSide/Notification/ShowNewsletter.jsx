import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import Swal from "sweetalert2";

let url = process.env.REACT_APP_API_URL;

const ShowNewsletter = () => {
  const adminToken = localStorage.getItem("token");

  const [newsletter, setNewsletter] = useState([]);
  const [email, setEmail] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const localeText = {
    noRowsLabel: "No Data Found 😔",
  };

  const columns = [
    {
      field: "_id",
      width: 300,
      headerName: "Id",
    },
    {
      field: "email",
      headerName: "Email",
      width: 225,
      filterable: true,
      sortable: true,
    },
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton
            aria-label="delete"
            onClick={() => handleCategoryDelete(params.row._id)}
          >
            <i className="fas fa-trash-alt font-size-16 font-Icon-Del"></i>
          </IconButton>
        </Stack>
      ),
      filterable: false,
      sortable: false,
      hide: false,
    },
  ];

  useEffect(() => {
    async function getCategory() {
      try {
        const res = await axios.get(`${url}/newsletter/get`, {
          headers: {
            Authorization: `${adminToken}`,
          },
        });

        setNewsletter(res?.data?.category || []);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    }
    getCategory();
  }, []);

  const handleCategoryDelete = (id) => {
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
          .delete(`${url}/newsletter/delete/${id}`, {
            headers: {
              Authorization: `${adminToken}`,
            },
          })
          .then(() => {
            setNewsletter(newsletter.filter((d) => d?._id !== id));
            Swal.fire("Success!", "Email has been deleted!", "success");
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "Email has not been deleted!", "error");
          });
      }
    });
  };

  const handleMultipleCategoryDelete = () => {
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
          .delete(`${url}/newsletter/deletes`, {
            data: { ids: idsToDelete },
            headers: {
              Authorization: `${adminToken}`,
            },
          })
          .then(() => {
            setNewsletter(
              newsletter?.filter((d) => !idsToDelete?.includes(d?._id))
            );
            Swal.fire("Success!", "Emails have been deleted!", "success");
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "Emails have not been deleted!", "error");
          });
      }
    });
  };

  const handleFilter = () => {
    const filteredCategoryList = newsletter?.filter((newsletter) => {
      const formattedCategoryName = (newsletter?.email || "")
        .toLowerCase()
        .replace(/\s/g, "");
      let isCategoryName = true;
      if (email) {
        isCategoryName = formattedCategoryName.includes(
          email.toLowerCase().replace(/\s/g, "")
        );
      }

      return isCategoryName;
    });

    // Apply search query filtering
    const filteredData = filteredCategoryList.filter((newsletter) => {
      const formattedSearchQuery = searchQuery.toLowerCase().replace(/\s/g, "");
      const rowValues = Object.values(newsletter);
      for (let i = 0; i < rowValues.length; i++) {
        const formattedRowValue = String(rowValues[i])
          .toLowerCase()
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
              <div className="col-2 table-heading">Newsletter List</div>
              <div className="d-flex flex-wrap gap-2 mt-2"></div>
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
                <div className="datagrid-container">
                  <DataGrid
                    style={{ textTransform: "capitalize" }}
                    rows={handleFilter()}
                    allColumns={true}
                    columns={columns}
                    checkboxSelection
                    disableSelectionOnClick
                    getRowId={getRowId}
                    localeText={localeText}
                    loading={isLoading}
                    onCellClick={handleCellClick}
                    onRowSelectionModelChange={(e) => setSelectedRows(e)}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[1, 10, 25, 50, 100]}
                    slots={{ toolbar: GridToolbar }}
                  />
                  {selectedRows.length > 0 && (
                    <div className="row-data">
                      <div>{selectedRows.length} Emails selected</div>
                      <DeleteIcon
                        style={{ color: "red" }}
                        className="cursor-pointer"
                        onClick={handleMultipleCategoryDelete}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShowNewsletter;
