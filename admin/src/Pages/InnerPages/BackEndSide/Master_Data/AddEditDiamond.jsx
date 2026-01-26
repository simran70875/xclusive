import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  InputAdornment,
  Divider,
  Stack,
  MenuItem,
  Alert,
  IconButton,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const AddEditDiamondPricing = ({ mode = "add" }) => {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: "#fcfaf7", minHeight: "100vh" }}>
      <Paper
        elevation={0}
        sx={{
          maxWidth: 900,
          mx: "auto",
          p: { xs: 3, md: 5 },
          borderRadius: "16px",
          border: "1px solid #e0e0e0",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Header Section */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
              {mode === "add" ? "Add Diamond Rate" : "Edit Diamond Rate"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update pricing parameters for Round Brilliant Cut diamonds.
            </Typography>
          </Box>
          <IconButton onClick={() => window.history.back()}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Alert 
          icon={<InfoOutlinedIcon fontSize="inherit" />} 
          severity="info" 
          sx={{ mb: 4, borderRadius: "8px", backgroundColor: "#fffdf5", border: "1px solid #f9f1c7", color: "#856404" }}
        >
          <strong>Note:</strong> All diamond rates should be entered as <strong>Price Per Carat (₹)</strong>.
        </Alert>

        <Grid container spacing={3}>
          {/* Section 1: Physical Dimensions */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', color: '#D4AF37', mb: 1 }}>
              1. Physical Dimensions
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              disabled
              label="Diamond Shape"
              value="Round"
              variant="outlined"
            >
              <MenuItem value="Round">Round</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="MM Size"
              placeholder="e.g. 1.10 - 1.20"
              variant="outlined"
              helperText="Specify size range in millimeters"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Carat Per Piece"
              placeholder="e.g. 0.005"
              variant="outlined"
              InputProps={{
                endAdornment: <InputAdornment position="end">ct</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} sx={{ my: 1 }}>
            <Divider />
          </Grid>

          {/* Section 2: Lab Grown Pricing */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', color: '#2e7d32', mb: 1 }}>
              2. Lab Grown Pricing
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="LAB VVS/VS Rate"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} sx={{ my: 1 }}>
            <Divider />
          </Grid>

          {/* Section 3: Natural Diamond Pricing */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', color: '#1a1a1a', mb: 1 }}>
              3. Natural Diamond Pricing
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Natural FG VS"
              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Natural GH SI"
              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Natural HI SI"
              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              variant="outlined"
            />
          </Grid>

          {/* Form Actions */}
          <Grid item xs={12} sx={{ mt: 4 }}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                sx={{ 
                  borderRadius: "8px", 
                  px: 4, 
                  color: "#757575", 
                  borderColor: "#dcdcdc",
                  textTransform: 'none'
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                sx={{
                  backgroundColor: "#D4AF37",
                  "&:hover": { backgroundColor: "#B8962E" },
                  px: 4,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "0px 4px 12px rgba(212, 175, 55, 0.3)"
                }}
              >
                Save Diamond Rate
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AddEditDiamondPricing;