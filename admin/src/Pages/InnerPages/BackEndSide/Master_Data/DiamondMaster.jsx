import { useEffect, useState } from "react";
import {
  Stack,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  InputAdornment,
  Divider,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import AlertBox from "../../../../Components/AlertComp/AlertBox";

const DiamondMaster = () => {
  const url = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

   const axiosConfig = {
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
  };

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success | error

  useEffect(() => {
    fetchDiamondRates();
  }, []);

  const fetchDiamondRates = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/diamond`, axiosConfig);

      // 🔐 SAFETY CHECK
      const data = Array.isArray(res.data) ? res.data : res.data.data;

      const normalizedRows = (data || []).map((row) => ({
        ...row,
        qualityRates: row.qualityRates || {
          lab_vvs_vs: row.lab_vvs_vs ?? "",
          natural_fg_vs: row.natural_fg_vs ?? "",
          natural_gh_si: row.natural_gh_si ?? "",
          natural_hi_si: row.natural_hi_si ?? "",
        },
      }));

      setRows(normalizedRows);
    } catch (error) {
      console.error("Failed to fetch diamond rates", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id, field, value) => {
    setRows((prev) =>
      prev.map((row) => (row._id === id ? { ...row, [field]: value } : row)),
    );
  };

  const handleQualityChange = (id, field, value) => {
    setRows((prev) =>
      prev.map((row) =>
        row._id === id
          ? {
              ...row,
              qualityRates: {
                ...row.qualityRates,
                [field]: value,
              },
            }
          : row,
      ),
    );
  };

  const saveRow = async (row) => {
    setLoading(true);
    try {
      const payload = {
        shape: row.shape,
        mmFrom: Number(row.mmFrom),
        mmTo: Number(row.mmTo),
        caratWeightFrom: Number(row.caratWeightFrom),
        caratWeightTo: Number(row.caratWeightTo),
        sieveSize: row.sieveSize,
        lab_vvs_vs: Number(row.qualityRates.lab_vvs_vs),
        natural_fg_vs: Number(row.qualityRates.natural_fg_vs),
        natural_gh_si: Number(row.qualityRates.natural_gh_si),
        natural_hi_si: Number(row.qualityRates.natural_hi_si),
      };

      if (!row.isNew) payload._id = row._id;

      if (row.isNew) {
        await axios.post(`${url}/diamond`, payload, axiosConfig);
      } else {
        await axios.put(`${url}/diamond/${row._id}`, payload, axiosConfig);
      }

      setMessage("Diamond slab saved successfully");
      setMessageType("success");

      fetchDiamondRates();
    } catch (err) {
      setMessage("Failed to save diamond slab");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const deleteRow = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${url}/diamond/${id}`, axiosConfig);

      setMessage("Diamond slab deleted successfully");
      setMessageType("success");

      fetchDiamondRates();
    } catch (err) {
      setMessage("Failed to delete diamond slab");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        _id: `tmp-${Date.now()}`,
        shape: "round",
        mmFrom: "",
        mmTo: "",
        caratWeightFrom: "",
        caratWeightTo: "",
        sieveSize: "",
        qualityRates: {
          lab_vvs_vs: "",
          natural_fg_vs: "",
          natural_gh_si: "",
          natural_hi_si: "",
        },
        isNew: true,
      },
    ]);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage("");
      setMessageType("");
      let alertBox = document?.getElementById("alert-box");
      alertBox?.classList?.remove("alert-wrapper");
    }, 1500);

    return () => clearTimeout(timer);
  }, [messageType, message]);

  return (
    <div className="main-content dark">
      <div className="page-content">
        <div className="container-fluid">
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems={"center"}
            mb={3}
          >
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Diamond Master
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Editable pricing slabs – Round diamonds
              </Typography>
            </Box>

            <Button
              onClick={addRow}
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                bgcolor: "#D4AF37",
                borderRadius: "8px",
                "&:hover": { bgcolor: "#B8962E" },
              }}
            >
              Add Slab
            </Button>
          </Stack>

          <Paper sx={{ p: 3, borderRadius: "12px" }}>
            {/* Header Row */}
            <Stack
              direction="row"
              spacing={2}
              sx={{
                mb: 2,
                fontWeight: 600,
                color: "#777",
                fontSize: "12px",
              }}
            >
              <Box width={100}>MM From</Box>
              <Box width={100}>MM To</Box>
              <Box width={100}>From Weight</Box>
              <Box width={100}>To Weight</Box>
              <Box width={100}>Sieve Size</Box>
              <Box width={120}>LAB VVS/VS</Box>
              <Box width={120}>FG VS</Box>
              <Box width={120}>GH SI</Box>
              <Box width={120}>HI SI</Box>
              <Box width={100}>Action</Box>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {rows.map((row, index) => (
              <Box key={row._id} sx={{ mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    size="small"
                    value={row.mmFrom}
                    onChange={(e) =>
                      handleChange(row._id, "mmFrom", e.target.value)
                    }
                    sx={{ width: 100 }}
                  />

                  <TextField
                    size="small"
                    value={row.mmTo}
                    onChange={(e) =>
                      handleChange(row._id, "mmTo", e.target.value)
                    }
                    sx={{ width: 100 }}
                  />

                  <TextField
                    size="small"
                    value={row.caratWeightFrom}
                    onChange={(e) =>
                      handleChange(row._id, "caratWeightFrom", e.target.value)
                    }
                    sx={{ width: 100 }}
                  />

                  <TextField
                    size="small"
                    value={row.caratWeightTo}
                    onChange={(e) =>
                      handleChange(row._id, "caratWeightTo", e.target.value)
                    }
                    sx={{ width: 100 }}
                  />

                  <TextField
                    size="small"
                    value={row.sieveSize}
                    onChange={(e) =>
                      handleChange(row._id, "sieveSize", e.target.value)
                    }
                    sx={{ width: 100 }}
                  />

                  {[
                    "lab_vvs_vs",
                    "natural_fg_vs",
                    "natural_gh_si",
                    "natural_hi_si",
                  ].map((q) => (
                    <TextField
                      key={q}
                      size="small"
                      value={row.qualityRates[q] ?? ""}
                      onChange={(e) =>
                        handleQualityChange(row._id, q, e.target.value)
                      }
                      sx={{ width: 120 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                    />
                  ))}

                  <IconButton
                    disabled={loading}
                    onClick={() => saveRow(row)}
                    sx={{
                      backgroundColor: "#000",
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={18} />
                    ) : (
                      <SaveIcon sx={{ color: "#1a1a1a" }} />
                    )}
                  </IconButton>

                  {!row.isNew && (
                    <IconButton
                      disabled={loading}
                      onClick={() => deleteRow(row._id)}
                      sx={{
                        backgroundColor: "#d32f2f",
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Stack>

                {index !== rows.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
          </Paper>
        </div>
      </div>
      <AlertBox status={messageType} statusMessage={message} />
    </div>
  );
};

export default DiamondMaster;
