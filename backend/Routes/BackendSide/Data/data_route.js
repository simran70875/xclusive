const express = require('express')
const route = express.Router()
const Data = require('../../../Models/BackendSide/data_model')
const checkAdminOrRole2 = require('../../../Middleware/checkAdminOrRole2')

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Create Data
route.post('/add', checkAdminOrRole2, async (req, res) => {
    try {
        const { Data_Name } = req.body;
        const lowerCaseName = Data_Name?.toLowerCase();
        const capitalizedDataName = capitalizeFirstLetter(lowerCaseName);
        const existingData = await Data.findOne({ Data_Name: capitalizedDataName });

        if (existingData) {
            res.status(202).json({ type: "warning", message: "Data already exists!" });
        } else {
            const data = new Data({
                Data_Type: req.body.Data_Type,
                Data_Name: capitalizedDataName,
                Data_Label: req.body.Data_Label
            });

            await data.save();
            res.status(200).json({ type: "success", message: "Data added successfully!" });
        }
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
    }
});

// get all data 
route.get('/get', async (req, res) => {
    try {
        const data = await Data.aggregate([
            {
                $lookup: {
                    from: "products",
                    let: { dataId: "$_id", type: "$Data_Type" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $and: [{ $eq: ["$$type", "Brand"] }, { $eq: ["$Brand_Name", "$$dataId"] }] },

                                        { $and: [{ $eq: ["$$type", "Collection"] }, { $eq: ["$Collections", "$$dataId"] }] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "products"
                }
            },
            {
                $addFields: {
                    productsCount: { $size: "$products" }
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);

        res.status(200).json({
            type: "success",
            message: "Data found successfully!",
            data
        });

    } catch (error) {
        res.status(500).json({
            type: "error",
            message: "Server Error!",
            errorMessage: error
        });
    }
});


// find data by id
route.get('/get/:id', checkAdminOrRole2, async (req, res) => {
    const { dataId } = req.params
    try {
        const data = await Data.findOne({ _id: dataId, Data_Status: true });
        res.status(201).json({ type: "success", message: " Data found successfully!", datas: data || [] })

    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error })
    }
});

// Delete all datas
route.delete('/delete', checkAdminOrRole2, async (req, res) => {
    try {
        await Data.deleteMany();
        res.status(200).json({ type: "success", message: "All Categories deleted successfully!" });
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
    }
});


// Delete many datas
route.delete('/deletes', checkAdminOrRole2, async (req, res) => {
    try {
        const { ids } = req.body;
        const datas = await Data.find({ _id: { $in: ids } });
        await Data.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ type: "success", message: "All Categories deleted successfully!" });
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
    }
});


// Delete data by ID
route.delete('/delete/:id', checkAdminOrRole2, async (req, res) => {
    const dataId = req.params.id;
    try {
        await Data.findByIdAndDelete(dataId);
        res.status(200).json({ type: "success", message: "Data deleted successfully!" });
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
    }
});


// update only status 
route.patch("/update/status/:id", checkAdminOrRole2, async (req, res) => {

    const DataId = await req.params.id

    try {
        const { Data_Status } = req.body
        const newData = await Data.findByIdAndUpdate(DataId)
        newData.Data_Status = await Data_Status

        await newData.save()
        res.status(200).json({ type: "success", message: "Data Status update successfully!" })

    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error })
    }

})


// Update data
route.patch('/update/:id', checkAdminOrRole2, async (req, res) => {
    try {
        const dataId = req.params.id;
        const { Data_Name, Data_Label, Data_Type } = req.body;

        const lowerCaseName = Data_Name.toLowerCase();
        const capitalizedDataName = capitalizeFirstLetter(lowerCaseName);
        const existingData = await Data.findOne({ Data_Name: capitalizedDataName, _id: { $ne: dataId } });

        if (existingData) {
            return res.status(409).json({ type: "warning", message: "Data already exists!" });
        } else {
            const data = await Data.findById(dataId);
            if (!data) {
                return res.status(404).json({ type: "warning", message: "Data does not exist!" });
            }

            data.Data_Type = Data_Type
            data.Data_Name = capitalizedDataName;
            data.Data_Label = Data_Label;

            await data.save();
            res.status(200).json({ type: "success", message: "Data updated successfully!" });
        }
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
        console.log(error)
    }
});



module.exports = route

