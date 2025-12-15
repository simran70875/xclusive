const express = require('express')
const route = express.Router()
const Charges = require('../../../Models/Settings/add_charges_model')
const checkAdminRole = require('../../../Middleware/adminMiddleWares')

// create charges
route.post('/add', checkAdminRole, async (req, res) => {

    const {
        normalShipCharge,
        normalcoupdisc,
        coins_reward_user,
        usage_limit_user,
    } = req.body

    try {

        const newCharges = new Charges({
            Normal_Ship_Charge: normalShipCharge,
            Normal_Coup_Disc: normalcoupdisc,
            coins_reward_user,
            usage_limit_user,
        });

        await newCharges.save()
        res.status(200).json({ type: "success", message: "Charges added successfully!" });

    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
        console.log(error)
    }

})

// get all charges
route.get('/get', checkAdminRole, async (req, res) => {
    try {
        const charges = await Charges.find();
        let newcharges
        if (charges?.length <= 1) {
            newcharges = charges?.[0]
        }
        res.status(200).json({ type: "success", message: "Charges get successfully!", Charges: newcharges || {} });
    }
    catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
    }
})

// get charges by id
route.get('/get/:id', checkAdminRole, async (req, res) => {
    const chargesId = req.params.id;
    try {
        const charges = await Charges.findById(chargesId);
        if (!charges) {
            return res.status(404).json({ type: "error", message: "Charges not found!" });
        }
        res.status(200).json({ type: "success", message: "Charges get successfully!", Charges: charges });
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
        console.log(error);
    }
});

// update charges
route.patch('/update/:id', checkAdminRole, async (req, res) => {
    const chargesId = req.params.id;

    const {
        normalShipCharge,
        normalcoupdisc,
        coins_reward_user,
        usage_limit_user
    } = req.body;

    try {
        const existingCharges = await Charges.findByIdAndUpdate(
            chargesId,
            {
                Normal_Ship_Charge: normalShipCharge,
                Normal_Coup_Disc: normalcoupdisc,
                coins_reward_user: coins_reward_user,
                usage_limit_user: usage_limit_user,

            },
            { new: true }
        );

        if (!existingCharges) {
            return res.status(404).json({ type: "error", message: "Charges not found!" });
        }

        res.status(200).json({ type: "success", message: "Charges updated successfully!", charges: existingCharges });

    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
    }
});

// delete All charges
route.delete('/delete', checkAdminRole, async (req, res) => {
    try {
        await Charges.deleteMany();
        res.status(200).json({ type: "success", message: "All Charges deleted successfully!" });
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
    }
});


module.exports = route