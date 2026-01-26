const cron = require("node-cron");
const axios = require("axios");
const metalPriceMaster = require("../../Models/FrontendSide/metalPriceMaster");

const updateGoldPrice = async () => {
  try {
    console.log("🔄 Updating gold price...");

    const response = await axios.get("https://www.goldapi.io/api/XAU/INR", {
      headers: {
        "x-access-token": process.env.GOLD_API_KEY,
      },
    });

    const apiData = response.data;
    const baseRate = apiData.price_gram_24k;

    // Fetch existing Gold record
    const gold = await metalPriceMaster.findOne({ metalName: "Gold" });
    if (!gold) {
      console.log("⚠️ Gold metal not found in DB");
      return;
    }

    // Recalculate purity rates
    const updatedPurityRates = gold.purityRates.map((p) => {
      const apiKey = `price_gram_${p.purity}k`;

      const ratePerGram = apiData[apiKey]
        ? apiData[apiKey]
        : baseRate * (p.purity / gold.basePurity);

      return {
        purity: p.purity,
        factor: p.purity / gold.basePurity,
        ratePerGram,
      };
    });

    // Update DB
    await metalPriceMaster.updateOne(
      { metalName: "Gold" },
      {
        baseRate,
        purityRates: updatedPurityRates,
        updatedAt: new Date(),
      },
    );

    console.log("✅ Gold price updated successfully");
  } catch (err) {
    console.error("❌ Gold price update failed:", err.message);
  }
};

/**
 * 🕘 CRON SCHEDULE
 * Runs every day at 9 AM
 */
cron.schedule("0 9 * * *", updateGoldPrice);
