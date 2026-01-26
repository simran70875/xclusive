import React, { useState } from "react";
import {
  Stack,
  Button,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Paper,
  Alert,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import axios from "axios";
import { useEffect } from "react";
import AlertBox from "../../../../Components/AlertComp/AlertBox";

const MetalMasterDashboard = () => {
  let url = process.env.REACT_APP_API_URL;
  const adminToken = localStorage.getItem("token");
  const axiosConfig = {
    headers: {
      Authorization: adminToken,
      "Content-Type": "application/json",
    },
  };

  // Mock data representing the state
  const [metalPrices, setMetalPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataAddStatus, setDataAddStatus] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    metalName: "",
    symbol: "",
    basePurity: "",
    priceSource: "manual",
    baseRate: "",
    purities: [],
  });

  useEffect(() => {
    fetchMetalPrices();
  }, []);

  const fetchMetalPrices = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${url}/metal`, axiosConfig);

      // 🔑 Backend usually returns { type, message, data }
      const metalsArray = response.data.data || response.data;

      if (!Array.isArray(metalsArray)) {
        throw new Error("Invalid metal data received");
      }

      const rows = [];

      metalsArray.forEach((metal) => {
        if (!Array.isArray(metal.purityRates)) return;

        metal.purityRates.forEach((p) => {
          rows.push({
            id: `${metal._id}-${p.purity}`,
            metalName: metal.metalName,
            label: `${metal.metalName} ${p.purity}K`,
            purity: p.purity,
            rate: p.ratePerGram,
            source: metal.priceSource === "goldapi" ? "Live" : "Manual",
            basePurity: metal.basePurity,
            symbol: metal.symbol,
            lastUpdated: metal.updatedAt,
          });
        });
      });

      setMetalPrices(rows);
    } catch (error) {
      console.error(error);

      setDataAddStatus("error");
      setStatusMessage(
        error.response?.data?.message || "Unable to load metal prices",
      );

      const alertBox = document.getElementById("alert-box");
      alertBox?.classList.add("alert-wrapper");
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (id, newValue) => {
    setMetalPrices((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, rate: Number(newValue) } : item,
      ),
    );
  };

  //update metal prices
  const handleSave = async () => {
    try {
      setLoading(true);

      const grouped = {};

      metalPrices.forEach((row) => {
        if (!grouped[row.metalName]) {
          grouped[row.metalName] = {
            metalName: row.metalName,
            symbol: row.symbol,
            basePurity: row.basePurity,
            priceSource: row.source === "Live" ? "goldapi" : "manual",
            purities: [],
            baseRate: row.rate,
          };
        }
        grouped[row.metalName].purities.push(row.purity);
      });

      for (const metalName in grouped) {
        await axios.post(`${url}/metal/add`, grouped[metalName], axiosConfig);
      }

      setDataAddStatus("success");
      setStatusMessage("Metal prices updated successfully");

      const alertBox = document.getElementById("alert-box");
      alertBox?.classList.add("alert-wrapper");

      fetchMetalPrices();
    } catch (error) {
      console.error(error);

      setDataAddStatus("error");
      setStatusMessage(
        error.response?.data?.message || "Failed to update metal prices",
      );

      const alertBox = document.getElementById("alert-box");
      alertBox?.classList.add("alert-wrapper");
    } finally {
      setLoading(false);
    }
  };

  //handle add metal
  const handleAddMetal = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        `${url}/metal/add`,
        formData,
        axiosConfig,
      );

      setDataAddStatus("success");
      setStatusMessage(response.data.message || "Metal added successfully");

      const alertBox = document.getElementById("alert-box");
      alertBox?.classList.add("alert-wrapper");

      setOpenModal(false);
      setFormData({
        metalName: "",
        symbol: "",
        basePurity: "",
        priceSource: "manual",
        baseRate: "",
        purities: [],
      });

      fetchMetalPrices();
    } catch (error) {
      console.error(error);

      setDataAddStatus("error");
      setStatusMessage(error.response?.data?.message || "Failed to add metal");

      const alertBox = document.getElementById("alert-box");
      alertBox?.classList.add("alert-wrapper");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDataAddStatus("");
      setStatusMessage("");
      let alertBox = document?.getElementById("alert-box");
      alertBox?.classList?.remove("alert-wrapper");
    }, 1500);

    return () => clearTimeout(timer);
  }, [dataAddStatus, statusMessage]);

  return (
    <div className="main-content dark">
      <div className="page-content">
        <div className="container-fluid">
          {/* Header Section */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#1a1a1a" }}
              >
                Metal Master
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Instant pricing dashboard for precious metals.
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                onClick={() => setOpenModal(true)}
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{
                  borderColor: "#D4AF37",
                  color: "#D4AF37",
                  borderRadius: "8px",
                  "&:hover": {
                    borderColor: "#B8962E",
                    bgcolor: "rgba(212, 175, 55, 0.05)",
                  },
                }}
              >
                Add Metal
              </Button>
              <Button
                disabled={loading}
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{
                  bgcolor: "#D4AF37",
                  borderRadius: "8px",
                  "&:hover": { bgcolor: "#B8962E" },
                }}
              >
                Save Changes
              </Button>
            </Stack>
          </Stack>

          {/* System Status Alerts */}
          <Stack spacing={1.5} mb={4}>
            <Alert
              severity="info"
              icon={<InfoOutlinedIcon fontSize="small" />}
              sx={{
                borderRadius: "8px",
                border: "1px solid #b3e5fc",
                bgcolor: "#fff",
              }}
            >
              Gold prices are automatically synced from the live market every
              day at
              <strong> 9:00 AM</strong>. Product prices are calculated
              dynamically using the latest rates.
            </Alert>
          </Stack>

          {/* Pricing Grid Card */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: "12px",
              border: "1px solid #eee",
              bgcolor: "#fff",
            }}
          >
            <Typography
              variant="h6"
              sx={{ mb: 3, fontWeight: 600, fontSize: "1rem", color: "#555" }}
            >
              CURRENT METAL RATES (PER GRAM)
            </Typography>

            <Grid container spacing={4}>
              {metalPrices.map((metal) => (
                <Grid item xs={12} sm={6} md={4} key={metal.id}>
                  <Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, color: "#333" }}
                      >
                        {metal.label}{" "}
                        {metal.source === "Live" && (
                          <span style={{ color: "#D4AF37" }}>*</span>
                        )}
                      </Typography>
                      <Tooltip
                        title={
                          metal.source === "Live"
                            ? "Auto-synced"
                            : "Manual entry"
                        }
                      >
                        <Chip
                          label={metal.source}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: "18px",
                            fontSize: "10px",
                            color:
                              metal.source === "Live" ? "#2e7d32" : "#757575",
                            borderColor:
                              metal.source === "Live" ? "#2e7d32" : "#ddd",
                          }}
                        />
                      </Tooltip>
                    </Stack>

                    <TextField
                      fullWidth
                      size="small"
                      value={
                        metal.rate !== undefined && metal.rate !== null
                          ? Number(metal.rate).toFixed(4)
                          : ""
                      }
                      onChange={(e) =>
                        handlePriceChange(metal.id, e.target.value)
                      }
                      disabled={metal.source === "Live"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography
                              sx={{
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "#aaa",
                              }}
                            >
                              USD
                            </Typography>
                          </InputAdornment>
                        ),
                        sx: {
                          borderRadius: "8px",
                          bgcolor: metal.source === "Live" ? "#fcfaf7" : "#fff",
                          fontWeight: 600,
                          fontFamily: "monospace",
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: "#999", display: "block", mt: 0.5 }}
                    >
                      Purity: {metal.purity} | Unit: 1 Gram | Last synced:{" "}
                      {new Date(metal.lastUpdated).toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Dialog
            open={openModal}
            onClose={() => setOpenModal(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Add Metal</DialogTitle>

            <DialogContent>
              <Stack spacing={2} mt={1}>
                <TextField
                  label="Metal Name"
                  value={formData.metalName}
                  onChange={(e) =>
                    setFormData({ ...formData, metalName: e.target.value })
                  }
                  helperText="Enter the metal name (e.g. Gold, Silver, Platinum)"
                />

                <TextField
                  label="Base Purity"
                  type="number"
                  value={formData.basePurity}
                  onChange={(e) =>
                    setFormData({ ...formData, basePurity: e.target.value })
                  }
                  helperText="Enter the highest purity for this metal (e.g. 24 for Gold, 999 for Silver)"
                />

                <TextField
                  select
                  label="Price Source"
                  value={formData.priceSource}
                  onChange={(e) =>
                    setFormData({ ...formData, priceSource: e.target.value })
                  }
                  SelectProps={{ native: true }}
                  helperText="Choose Live for automatic price updates or Manual to enter rates yourself"
                >
                  <option value="manual">Manual</option>
                  <option value="goldapi">Live (Gold API)</option>
                </TextField>

                {formData.priceSource === "manual" && (
                  <TextField
                    label="Base Rate"
                    type="number"
                    value={formData.baseRate}
                    onChange={(e) =>
                      setFormData({ ...formData, baseRate: e.target.value })
                    }
                    helperText="Enter price per gram for the base purity (used for manual calculation)"
                  />
                )}

                <TextField
                  label="Purities (comma separated)"
                  placeholder="24,22,18"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      purities: e.target.value
                        .split(",")
                        .map((p) => Number(p.trim())),
                    })
                  }
                  helperText="Enter all supported purities separated by commas (e.g. 24,22,18)"
                />
              </Stack>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setOpenModal(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleAddMetal}>
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
      <AlertBox status={dataAddStatus} statusMessage={statusMessage} />
    </div>
  );
};

export default MetalMasterDashboard;
