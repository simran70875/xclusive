const diamondPriceMaster = require("../../../Models/FrontendSide/diamondPriceMaster");
const express = require("express");
const checkAdminOrRole1 = require("../../../Middleware/checkAdminOrRole1");
const route = express.Router();

route.post("/", checkAdminOrRole1, async (req, res) => {
  const {
    shape,
    mmFrom,
    mmTo,
    caratWeightFrom,
    caratWeightTo,
    sieveSize,
    lab_vvs_vs,
    natural_fg_vs,
    natural_gh_si,
    natural_hi_si
  } = req.body;

  const doc = await diamondPriceMaster.create({
    shape,
    mmFrom,
    mmTo,
    caratWeightFrom,
    caratWeightTo,
    sieveSize,
    qualityRates: {
      lab_vvs_vs,
      natural_fg_vs,
      natural_gh_si,
      natural_hi_si
    },
    updatedAt: new Date()
  });

  res.json({
    message: "Diamond pricing created",
    data: doc
  });
});

route.put("/:id", checkAdminOrRole1, async (req, res) => {
  const {
    shape,
    mmFrom,
    mmTo,
    caratWeightFrom,
    caratWeightTo,
    sieveSize,
    lab_vvs_vs,
    natural_fg_vs,
    natural_gh_si,
    natural_hi_si
  } = req.body;

  const updated = await diamondPriceMaster.findByIdAndUpdate(
    req.params.id,
    {
      shape,
      mmFrom,
      mmTo,
      caratWeightFrom,
      caratWeightTo,
      sieveSize,
      qualityRates: {
        lab_vvs_vs,
        natural_fg_vs,
        natural_gh_si,
        natural_hi_si
      },
      updatedAt: new Date()
    },
    { new: true }
  );

  res.json({
    message: "Diamond pricing updated",
    data: updated
  });
});

route.get("/", checkAdminOrRole1, async (req, res) => {
  const data = await diamondPriceMaster.find({ active: true })

  res.json(data);
});

route.put("/:id",checkAdminOrRole1, async (req, res) => {
  const updated = await diamondPriceMaster.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      updatedAt: new Date()
    },
    { new: true }
  );

  res.json({
    message: "Diamond pricing updated",
    data: updated
  });
});

route.delete("/:id",checkAdminOrRole1, async (req, res) => {
  await diamondPriceMaster.findByIdAndDelete(req.params.id);

  res.json({ message: "Diamond pricing removed" });
});


module.exports = route;

