const axios = require("axios");
const metalPriceMaster = require("../../../Models/FrontendSide/metalPriceMaster");
const express = require("express");
const checkAdminOrRole1 = require("../../../Middleware/checkAdminOrRole1");
const route = express.Router();

route.post(
  "/add",
  checkAdminOrRole1,
  async (req, res) => {
    try {
      const {
        metalName,
        symbol,
        basePurity,
        priceSource,
        baseRate,     // only for manual
        purities
      } = req.body;

      let finalBaseRate = baseRate;
      let apiData = null;

      // 🔁 Fetch live price if required
      if (priceSource === "goldapi") {
        const response = await axios.get(
          `https://www.goldapi.io/api/XAU/USD`,
          {
            headers: {
              "x-access-token": process.env.GOLD_API_KEY
            }
          }
        );

        apiData = response.data;
        finalBaseRate = apiData.price_gram_24k;
      }

      // 🧮 Calculate purity rates
      const purityRates = purities.map(purity => {
        let ratePerGram;

        if (apiData && apiData[`price_gram_${purity}k`]) {
          ratePerGram = apiData[`price_gram_${purity}k`];
        } else {
          const factor = purity / basePurity;
          ratePerGram = finalBaseRate * factor;
        }

        return {
          purity,
          factor: purity / basePurity,
          ratePerGram
        };
      });

      // 💾 Save
      const metalDoc = await metalPriceMaster.findOneAndUpdate(
        { metalName },
        {
          metalName,
          symbol,
          basePurity,
          baseRate: finalBaseRate,
          priceSource,
          purityRates,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );

      res.json({
        message: "Metal saved successfully",
        data: metalDoc
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to save metal",
        error: error.message
      });
    }
  }
);

route.get(
  "/",
  checkAdminOrRole1,
  async (req, res) => {
    try {
      const metals = await metalPriceMaster
        .find()
        .sort({ updatedAt: -1 });

      res.json(metals);
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch metals",
        error: error.message
      });
    }
  }
);

route.get(
  "/:id",
  checkAdminOrRole1,
  async (req, res) => {
    try {
      const metal = await metalPriceMaster.findById(req.params.id);

      if (!metal) {
        return res.status(404).json({ message: "Metal not found" });
      }

      res.json(metal);
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch metal",
        error: error.message
      });
    }
  }
);

route.delete(
  "/:id",
  checkAdminOrRole1,
  async (req, res) => {
    try {
      await metalPriceMaster.findByIdAndDelete(req.params.id);
      res.json({ message: "Metal deleted successfully" });
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete metal",
        error: error.message
      });
    }
  }
);


module.exports = route;