import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { editBanner } from "../../../../Redux/Actions/BackendActions/BannerActions";
import Modal from "react-modal";
import ImageModel from "../../../../Components/ImageComp/ImageModel";
let url = process.env.REACT_APP_API_URL;

const ShowPopBanner = () => {
  const [bannerData, setBannerData] = useState([]);

  // for big image
  const [selectedImage, setSelectedImage] = useState("");
  const [isModalOpenforImage, setIsModalOpenforImage] = useState(false);

  const handleImageClick = (imageURL) => {
    setSelectedImage(imageURL);
    setIsModalOpenforImage(true);
  };

  const Navigate = useNavigate();
  const dispatch = useDispatch();
  const localeText = {
    noRowsLabel: "No Data Found 😔",
  };

  useEffect(() => {
    async function getBanner() {
      try {
        const adminToken = localStorage.getItem("token");
        const res = await axios.get(`${url}/popup/banner/get`, {
          headers: {
            Authorization: `${adminToken}`,
          },
        });
        setBannerData(res.data || []);
      } catch (error) {
        console.log("error in get banner data", error);
      }
    }
    getBanner();
  }, []);


  const handleBannerDelete = (id) => {
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
        const adminToken = localStorage.getItem("token");
        axios
          .delete(`${url}/popup/banner/delete/${id}`, {
            headers: {
              Authorization: `${adminToken}`,
            },
          })
          .then(() => {
            setBannerData(bannerData.filter((d) => d?._id !== id));
            Swal.fire("Success!", "Banner has been deleted!", "success");
          })
          .catch((err) => {
            console.log(err);
            Swal.fire("Error!", "Banner has not been deleted!", "error");
          });
      }
    });
  };

  const handleBannerUpdate = (banner) => {
    console.log("updated banner data ==> ", banner);
    dispatch(editBanner(banner));
    Navigate("/editPopBanner");
  };

  const handleBannerStatus = async (banner, newStatus) => {
    try {
      const adminToken = localStorage.getItem("token");
      await axios.patch(
        `${url}/popup/banner/update/status/${banner?._id}`,
        {
          Banner_Status: newStatus,
        },
        {
          headers: {
            Authorization: `${adminToken}`,
          },
        }
      );

      const updatedBannerData = bannerData.map((c) =>
        c._id === banner._id ? { ...c, Banner_Status: newStatus } : c
      );
      setBannerData(updatedBannerData || []);
    } catch (error) {
      console.log(error);
    }
  };

  const columns = [
    {
      field: "_id",
      headerName: "Id",
      flex: 1,
    },
    {
      field: "Banner_Name",
      headerName: "Banner Name",
      flex: 2,
    },
    {
      field: "Banner_Image?.path",
      headerName: "Image",
      flex: 1,
      renderCell: (params) => (
        <>
          <img
            src={url + "/" + params.row?.Banner_Image?.path}
            alt="Banner Image"
            height="auto"
            width={100}
            style={{ borderRadius: 5, cursor: "pointer" }}
            onClick={() =>
              handleImageClick(url + "/" + params.row?.Banner_Image?.path)
            }
          />
        </>
      ),
    },
    {
      field: "Banner_Status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <div className="form-check form-switch">
          <input
            type="checkbox"
            className="form-check-input"
            id={`customSwitch-${params.id}`}
            onChange={() => handleBannerStatus(params.row, !params.value)}
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
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton
            aria-label="delete"
            onClick={() => handleBannerDelete(params.row._id)}
          >
            <i className="fas fa-trash-alt font-size-16 font-Icon-Del"></i>
          </IconButton>
          <IconButton
            aria-label="edit"
            onClick={() => handleBannerUpdate(params.row)}
          >
            <i className="fas fa-pencil-alt font-size-16 font-Icon-Up"></i>
          </IconButton>
        </Stack>
      ),
    },
  ];



  const getRowId = (row) => row._id;

  return (
    <>
      <div className="main-content">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-2 table-heading">Banner List</div>

              {bannerData.length != 0 ? null : (
                <div className="d-flex flex-wrap gap-2 my-3">
                  <button
                    onClick={() => Navigate("/addPopBanner")}
                    className="btn btn-primary waves-effect waves-light"
                  >
                    Add Banner <i className="fas fa-arrow-right ms-2"></i>
                  </button>
                </div>
              )}

              <div className="col-12">
                <div className="datagrid-container">
                  <DataGrid
                    rowHeight={120}
                    style={{ textTransform: "capitalize" }}
                    rows={bannerData}
                    columns={columns}
                    disableSelectionOnClick
                    getRowId={getRowId}
                    localeText={localeText}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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

export default ShowPopBanner;
