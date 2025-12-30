const express = require('express')
const route = express.Router()
const multer = require('multer')
const { Variation, Product } = require('../../../Models/BackendSide/product_model');
const fs = require('fs');
const checkAdminOrRole2 = require('../../../Middleware/checkAdminOrRole2')

// Set up multer storage and limits
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "imageUploads/backend/variation");
    },
    filename: (req, file, cb) => {
        const extension = file.originalname.split(".").pop();
        cb(null, `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`);
    },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5 MB limit

// Create variations
route.post("/add/:productId", checkAdminOrRole2, upload.array("images", 5), async (req, res) => {
    try {
        const { Variation_Name, Variation_Label, Size_Name, Size_Stock, Size_Price, Size_Purity } = req.body;

        const productId = req.params.productId;

        const images = req.files.map((file) => ({
            filename: file.filename,
            path: file.path,
            originalname: file.originalname,
        }));

        const variationSizes = Array.isArray(Size_Name) ? Size_Name.map((size, index) => ({
            Size_Name: size,
            Size_Stock: Size_Stock[index],
            Size_Price: Size_Price[index],
            Size_purity: Size_Purity[index],
        }))
            : [
                {
                    Size_Name: Size_Name,
                    Size_Stock: Size_Stock,
                    Size_Price: Size_Price,
                    Size_purity: Size_Purity,
                },
            ];

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ type: "error", message: "Product not found!" });
        }

        const newVariation = new Variation({
            Variation_Name: Variation_Name,
            Variation_Images: images,
            Variation_Size: variationSizes,
            Variation_Label: Variation_Label,
        });

        await newVariation.save();

        product.Variation.unshift(newVariation._id);
        await product.save();

        res.status(200).json({ type: "success", message: "Variation added successfully!", variation: newVariation });
    } catch (error) {
        console.error("Failed to add variation:", error);
        res.status(500).json({ type: "error", message: "Failed to add variation" });
    }
});

// get all variation
route.get('/get', checkAdminOrRole2, async (req, res) => {
    try {
        const variation = await Variation.find().sort({ createdAt: -1 });
        if (variation) {
            const result = variation.map(variation => ({
                _id: variation._id,
                Variation_Name: variation.Variation_Name,
                Variation_Images: variation?.Variation_Images?.map(image => ({
                    Variation_Image: `${process.env.IP_ADDRESS}/${image?.path?.replace(/\\/g, '/')}`,
                })),
                Size: variation?.Variation_Size,
                Variation_Label: variation.Variation_Label,
                Variation_Status: variation.Variation_Status,
            }))
            return res.status(201).json({ type: "success", message: " Variation found successfully!", variation: result || [] })
        }
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error })
    }
});


// find variation by id
route.get('/get/:id', checkAdminOrRole2, async (req, res) => {

    const variationId = req.params.id

    try {
        const variation = await Variation.findById(variationId)
        if (variation) {
            const result = {
                _id: variation._id,
                Variation_Name: variation.Variation_Name,
                Variation_Images: variation?.Variation_Images?.map(image => ({
                    Variation_Image: `${process.env.IP_ADDRESS}/${image?.path?.replace(/\\/g, '/')}`,
                })),
                Size: variation?.Variation_Size,
                Variation_Label: variation.Variation_Label,
                Variation_Status: variation.Variation_Status,
            }
            return res.status(201).json({ type: "success", message: "Variation found successfully!", variation: result || [] })
        }
        else {
            res.status(404).json({ type: "warning", message: "Variation not found !" })
        }
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error })
        console.log(error)
    }
});

// Delete all variations
route.delete('/delete', checkAdminOrRole2, async (req, res) => {
    try {
        const variations = await Variation.find();

        for (const variation of variations) {
            for (const image of variation?.Variation_Images) {
                if (fs.existsSync(image?.path)) {
                    fs.unlinkSync(image?.path);
                }
            }
        }

        await Variation.deleteMany();
        res.status(200).json({ type: "success", message: "All Variations deleted successfully!" });
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
    }
});


// Delete many variations
route.delete('/deletes', checkAdminOrRole2, async (req, res) => {
    try {
        const { ids } = req.body;
        const variations = await Variation.find({ _id: { $in: ids } });

        for (const variation of variations) {
            for (const image of variation?.Variation_Images) {
                if (fs.existsSync(image?.path)) {
                    fs.unlinkSync(image?.path);
                }
            }
        }

        await Variation.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ type: "success", message: "All Variations deleted successfully!" });
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
    }
});


// Delete variation by ID
route.delete('/delete/:id', checkAdminOrRole2, async (req, res) => {
    const variationId = req.params.id;
    try {
        const variation = await Variation.findById(variationId);
        if (!variation) {
            res.status(404).json({ type: "error", message: "Variation not found!" });
        } else {
            // Delete the variation images from the folder
            for (const image of variation.Variation_Images) {
                if (fs.existsSync(image?.Variation_Image)) {
                    fs.unlinkSync(image?.Variation_Image);
                }
            }

            await Variation.findByIdAndDelete(variationId);
            res.status(200).json({ type: "success", message: "Variation deleted successfully!" });
        }
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
    }
});


// Delete multiple variations by IDs
route.delete('/deletes', checkAdminOrRole2, async (req, res) => {
    const { ids } = req.body;
    try {
        const variations = await Variation.find({ _id: { $in: ids } });

        // Delete images from the folder for each variation
        variations.forEach((variation) => {
            variation?.Variation_Images?.forEach((image) => {
                if (fs.existsSync(image?.Variation_Image)) {
                    fs.unlinkSync(image?.Variation_Image);
                }
            });
        });

        // Delete the variations from the database
        await Variation.deleteMany({ _id: { $in: ids } });

        res.status(200).json({ type: "success", message: "Variations deleted successfully!" });
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
    }
});


// update only status 
route.patch("/update/status/:id", checkAdminOrRole2, async (req, res) => {

    const variationId = await req.params.id

    try {
        const { variation_Status } = req.body
        const newVariation = await Variation.findByIdAndUpdate(variationId)
        newVariation.Variation_Status = await variation_Status

        await newVariation.save()
        res.status(200).json({ type: "success", message: "Variation Status update successfully!" })

    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error })
    }

})


// update only size status
route.patch("/update/size/status/:variationId/:sizeId", checkAdminOrRole2, async (req, res) => {
    const variationId = req.params.variationId;
    const sizeId = req.params.sizeId;

    try {
        const { Size_Status } = req.body;

        // Find the variation by ID
        const variation = await Variation.findById(variationId);
        if (!variation) {
            return res.status(404).json({ type: "error", message: "Variation not found!" });
        }

        // Find the size in the Variation_Size array with the given sizeId
        const sizeToUpdate = variation.Variation_Size.find((size) => size._id.toString() === sizeId);
        if (!sizeToUpdate) {
            return res.status(404).json({ type: "error", message: "Size not found in the variation!" });
        }

        // Update the Size_Status of the size
        sizeToUpdate.Size_Status = Size_Status;

        // Save the updated variation
        await variation.save();

        res.status(200).json({ type: "success", message: "Size Status update successfully!" });
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
    }
});

// delete a particular size
route.delete("/delete/size/:variationId/:sizeId", checkAdminOrRole2, async (req, res) => {
    const variationId = req.params.variationId;
    const sizeId = req.params.sizeId;

    try {
        // Find the variation by ID
        const variation = await Variation.findById(variationId);
        if (!variation) {
            return res.status(404).json({ type: "error", message: "Variation not found!" });
        }

        // Filter out the size to delete from the Variation_Size array
        const updatedSizes = variation.Variation_Size.filter((size) => size._id.toString() !== sizeId);

        // Check if the size exists in the array
        if (variation.Variation_Size.length === updatedSizes.length) {
            return res.status(404).json({ type: "error", message: "Size not found in the variation!" });
        }

        // Update the Variation_Size array with the filtered sizes
        variation.Variation_Size = updatedSizes;

        // Save the updated variation
        await variation.save();

        res.status(200).json({ type: "success", message: "Size deleted successfully!" });
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
    }
});

// Delete multiple sizes from a variation
// route.delete("/deletes/sizes/:variationId", async (req, res) => {
//     const variationId = req.params.variationId;
//     const { sizeIds } = req.body;

//     try {
//         // Find the variation by ID
//         const variation = await Variation.findById(variationId);
//         if (!variation) {
//             return res.status(404).json({ type: "error", message: "Variation not found!" });
//         }

//         // Filter out the sizes to delete from the Variation_Size array
//         const updatedSizes = variation.Variation_Size.filter((size) => !sizeIds.includes(size._id.toString()));

//         // Check if all sizeIds exist in the Variation_Size array
//         if (variation.Variation_Size.length === updatedSizes.length + sizeIds.length) {
//             return res.status(404).json({ type: "error", message: "Sizes not found in the variation!" });
//         }

//         // Update the Variation_Size array with the filtered sizes
//         variation.Variation_Size = updatedSizes;

//         // Save the updated variation
//         await variation.save();

//         res.status(200).json({ type: "success", message: "Sizes deleted successfully!" });
//     } catch (error) {
//         res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
//     }
// });

// Delete multiple sizes from a variation
route.delete("/deletes/sizes/:variationId", checkAdminOrRole2, async (req, res) => {
    const variationId = req.params.variationId;
    const { sizeIds } = req.body;

    try {
        // Find the variation by ID
        const variation = await Variation.findById(variationId);
        if (!variation) {
            return res.status(404).json({ type: "error", message: "Variation not found!" });
        }

        // Filter out the sizes to delete from the Variation_Size array
        variation.Variation_Size = variation.Variation_Size.filter((size) => !sizeIds.includes(size._id.toString()));

        // Save the updated variation
        await variation.save();

        res.status(200).json({ type: "success", message: "Sizes deleted successfully!" });
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
    }
});

// Update variation by id
route.patch('/update/:variationId', checkAdminOrRole2, upload.array('images', 5), async (req, res) => {
    try {
        const { Variation_Name } = req.body;
        const variationId = req.params.variationId;

        const images = req.files.map((file) => {
            const originalFilename = file.originalname;
            const extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
            const random = Math.random() * 100;
            const imageFilename = `${Variation_Name.replace(/\s/g, '_')}_${Date.now()}_${random}${extension}`;
            const imagePath = 'imageUploads/backend/variation/' + imageFilename;

            fs.renameSync(file?.path, imagePath);

            return {
                filename: imageFilename,
                path: imagePath,
                originalname: originalFilename
            };
        });


        // Find the variation by ID
        const variation = await Variation.findById(variationId);
        if (!variation) {
            return res.status(404).json({ type: "error", message: "Variation not found!" });
        }

        // Update the variation fields
        variation.Variation_Name = Variation_Name;
        if (req.files.length <= 0) {
        }
        else {
            variation.Variation_Images = images;
        }
        // variation.Variation_Label = Variation_Name;

        // Save the updated variation to the database
        await variation.save();

        res.status(200).json({ type: "success", message: "Variation updated successfully!" });
    } catch (error) {
        console.error('Failed to update variation:', error);
        res.status(500).json({ error: 'Failed to update variation' });
    }
});

// Update a variation size by ID
route.patch("/update/size/:variationId/:sizeId", checkAdminOrRole2, async (req, res) => {
    try {
        const variationId = req.params.variationId;
        const sizeId = req.params.sizeId;
        const { Size_Name, Size_Stock, Size_Price } = req.body;

        const variation = await Variation.findById(variationId);
        if (!variation) {
            return res.status(404).json({ type: "error", message: "Variation not found!" });
        }

        const sizeIndex = variation.Variation_Size.findIndex((size) => size._id.toString() === sizeId);
        if (sizeIndex === -1) {
            return res.status(404).json({ type: "error", message: "Variation size not found!" });
        }

        // Update the variation size data
        variation.Variation_Size[sizeIndex].Size_Name = Size_Name;
        variation.Variation_Size[sizeIndex].Size_Stock = Size_Stock;
        variation.Variation_Size[sizeIndex].Size_Price = Size_Price;

        // Save the updated variation to the database
        await variation.save();

        res.status(200).json({ type: "success", message: "Variation size updated successfully!" });
    } catch (error) {
        console.error("Failed to update variation size:", error);
        res.status(500).json({ type: "error", message: "Failed to update variation size" });
    }
});

// Add a new size to a variation
route.post("/add/size/:variationId", checkAdminOrRole2, async (req, res) => {
    try {
        const variationId = req.params.variationId;
        const { Size_Name, Size_Stock, Size_Price, Size_Purity } = req.body;

        const variation = await Variation.findById(variationId);
        if (!variation) {
            return res.status(404).json({ type: "error", message: "Variation not found!" });
        }

        // Create a new size object
        const newSize = {
            Size_Name,
            Size_Stock,
            Size_Price,
            Size_purity: Size_Purity,
            Size_Status: true, // Set the default status to true (enabled)
        };

        // Add the new size to the Variation_Size array
        variation.Variation_Size.unshift(newSize);

        // Save the updated variation to the database
        await variation.save();

        res.status(201).json({ type: "success", message: "Size added successfully!", size: newSize });
    } catch (error) {
        console.error("Failed to add size:", error);
        res.status(500).json({ type: "error", message: "Failed to add size" });
    }
});



module.exports = route
