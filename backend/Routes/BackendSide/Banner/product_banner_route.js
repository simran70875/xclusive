const express = require('express')
const route = express.Router()
const multer = require('multer')
const Banner = require('../../../Models/BackendSide/product_banner_model')
const fs = require('fs');
const checkAdminOrRole2 = require('../../../Middleware/checkAdminOrRole2')


// Set up multer middleware to handle file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './imageUploads/backend/productBanner')
    },
    filename: function (req, file, cb) {
        cb(null, file?.originalname)
    }
})
const upload = multer({ storage: storage })


// Create Banner
route.post('/add', checkAdminOrRole2, upload.single('image'), async (req, res) => {
    try {
        const { Banner_Sequence, Banner_Name } = req.body;

        const existingBanner = await Banner.findOne(req.body);
        const existingSequence = await Banner.findOne({ Banner_Sequence });
        const existingBannerName = await Banner.findOne({ Banner_Name });

        if (existingBanner) {
            // Delete the uploaded image if the banner already exists
            fs.unlinkSync(req.file?.path);
            res.status(202).json({ type: "warning", message: "Banner already exists!" });
        } else if (existingBannerName) {
            // Delete the uploaded image if a banner with the same name already exists
            fs.unlinkSync(req.file?.path);
            res.status(202).json({ type: "warning", message: "Banner with the same name already exists!" });
        } else if (existingSequence) {
            // Delete the uploaded image if a banner with the same sequence already exists
            fs.unlinkSync(req.file?.path);
            res.status(202).json({ type: "warning", message: "Sequence already exists! Please add a different sequence." });
        } else {
            const banner = new Banner({
                Banner_Name: req.body.Banner_Name,
                Banner_Sequence: req.body.Banner_Sequence,
                ProductId: req.body.ProductId,
                Banner_Label: req.body.Banner_Label
            });

            if (req?.file) {
                const originalFilename = req.file.originalname;
                const extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
                const imageFilename = `${req.body.Banner_Name.replace(/\s/g, '_')}${extension}`;
                const imagePath = 'imageUploads/backend/productBanner/' + imageFilename;

                fs.renameSync(req?.file?.path, imagePath);

                const image = {
                    filename: imageFilename,
                    path: imagePath,
                    originalname: originalFilename
                };
                banner.Banner_Image = image;
            }

            await banner.save();
            res.status(200).json({ type: "success", message: "Banner added successfully!" });
        }
    } catch (error) {
        if (req?.file) {
            fs.unlinkSync(req?.file?.path);
        }
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
    }
});

// get all banner
route.get('/get', checkAdminOrRole2, async (req, res) => {
    try {
        const banner = await Banner.find().populate('ProductId', 'Product_Name').sort({ createdAt: -1 });

        if (banner) {

            const result = banner.map(banner => ({
                _id: banner._id,
                Banner_Name: banner.Banner_Name,
                banner_Image: `${process.env.IP_ADDRESS}/${banner.Banner_Image?.path?.replace(/\\/g, '/')}`,
                
                Banner_Sequence: banner.Banner_Sequence,
                Banner_Label: banner.Banner_Label,
                Banner_Status: banner.Banner_Status,
                ProductId: banner.ProductId?._id,
                Product_Name: banner.ProductId?.Product_Name
            }));

            const banners = await Banner.find({ Banner_Status: true }).sort({ createdAt: -1 });
            let results = []
            if (banners) {
                results = banners.map(banner => ({
                    _id: banner._id,
                    Banner_Name: banner.Banner_Name,
                    banner_Image: `${process.env.IP_ADDRESS}/${banner.Banner_Image?.path?.replace(/\\/g, '/')}`,
                    Banner_Sequence: banner.Banner_Sequence,
                    Banner_Label: banner.Banner_Label,
                    ProductId: banner.ProductId
                }));
            }
            res.status(201).json({ type: "success", message: " Banner found successfully!", banner: result || [], banner_data: results || [] })
        }
        else {
            res.status(404).json({ type: "warning", message: " No Banner Found!", banner: [], banners: [] })
        }

    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error })
        console.log(error)
    }
});

// get banner by id
route.get('/get/:id', checkAdminOrRole2, async (req, res) => {
    const bannerId = req.params.id
    try {
        const banner = await Banner.findById(bannerId)
        if (!banner) {
            res.status(404).json({ type: "warning", message: "No Banner found!", banner: [] })
        }
        else {
            const result = {
                _id: banner._id,
                Banner_Name: banner.Banner_Name,
                banner_Image: `${process.env.IP_ADDRESS}/${banner.Banner_Image?.path?.replace(/\\/g, '/')}`,
                Banner_Sequence: banner.Banner_Sequence,
                Banner_Label: banner.Banner_Label,
                ProductId: banner.ProductId,
            }
            res.status(201).json({ type: "success", message: " Banner found successfully!", banner: result })
        };
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error })
    }
});

// get all banner for mobile
route.get('/mob/get', async (req, res) => {
    try {
        const banner = await Banner.find({ Banner_Status: true }).populate('ProductId', 'Product_Name').sort({ banner_sequence: -1 });
        if (!banner) {
            res.status(404).json({ type: "warning", message: "No Banner found!", banner: [] })
        }
        else {
            const result = banner.map(banner => ({
                banner_id: banner._id,
                banner_Image: `${process.env.IP_ADDRESS}/${banner.Banner_Image?.path?.replace(/\\/g, '/')}` || "",
                banner_sequence: banner.Banner_Sequence,
                productId: banner.ProductId?._id,
                productName: banner.ProductId?.Product_Name
            }));
            res.status(201).json({ type: "success", message: " Banner found successfully!", banner: result })
        }
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error })
    }
});

// get banner by id for mobile
route.get('/mob/get/:id', async (req, res) => {
    const bannerId = req.params.id
    try {
        const banner = await Banner.findById(bannerId)
        if (!banner) {
            res.status(404).json({ type: "warning", message: "No Banner found!" })
        }
        else {
            const result = {
                banner_id: banner._id,
                banner_Name: banner.Banner_Name,
                banner_Image: `${process.env.IP_ADDRESS}/${banner.Banner_Image?.path?.replace(/\\/g, '/')}` || "",
               
                banner_sequence: banner.Banner_Sequence,
                productId: banner.ProductId
            };
            res.status(201).json({ type: "success", message: " Banner found successfully!", banner: result })
        }
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error })
    }
});

// Delete all banners
route.delete('/delete', checkAdminOrRole2, async (req, res) => {
    try {
        const banners = await Banner.find();

        if (banners.length > 0) {
            for (const banner of banners) {
                if (banner.Banner_Image && fs.existsSync(banner.Banner_Image.path)) {
                    fs.unlinkSync(banner.Banner_Image.path);
                }
            }
        }

        await Banner.deleteMany();
        res.status(200).json({ type: "success", message: "All Banners deleted successfully!" });
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
    }
});

// Delete a specific banner by ID
route.delete('/delete/:id', checkAdminOrRole2, async (req, res) => {
    const bannerId = req.params.id;
    try {
        const banner = await Banner.findById(bannerId);
        if (!banner) {
            res.status(404).json({ type: "error", message: "Banner not found!" });
        } else {
            // Delete the image file from the folder if it exists
            if (banner.Banner_Image && fs.existsSync(banner.Banner_Image.path)) {
                fs.unlinkSync(banner.Banner_Image.path);
            }

            await Banner.findByIdAndDelete(bannerId);
            res.status(200).json({ type: "success", message: "Banner deleted successfully!" });
        }
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
    }
});

// Delete multiple banners by IDs
route.delete('/deletes', checkAdminOrRole2, async (req, res) => {
    try {
        const { ids } = req.body;
        const banners = await Banner.find({ _id: { $in: ids } });

        for (const banner of banners) {
            // Delete the image file from the folder if it exists
            if (banner.Banner_Image && fs.existsSync(banner.Banner_Image.path)) {
                fs.unlinkSync(banner.Banner_Image.path);
            }
        }

        await Banner.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ type: "success", message: "All Banners deleted successfully!" });
    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
    }
});

// update only Bannerstatus 
route.patch("/update/status/:id", checkAdminOrRole2, async (req, res) => {

    const BannerId = await req.params.id

    try {
        const { Banner_Status } = req.body
        const newBanner = await Banner.findByIdAndUpdate(BannerId)
        newBanner.Banner_Status = await Banner_Status

        await newBanner.save()
        res.status(200).json({ type: "success", message: "Banner Status update successfully!" })

    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error })
    }

})

// Update a specific banner by ID
route.patch('/update/:id', checkAdminOrRole2, upload.single('image'), async (req, res) => {
    const bannerId = req.params.id;
    const { Banner_Name, Banner_Sequence, Banner_Label, ProductId } = req.body;

    try {
        const existingBanner = await Banner.findOne({ Banner_Name, _id: { $ne: bannerId } });
        const existingBannerSequence = await Banner.findOne({ Banner_Sequence, _id: { $ne: bannerId } });

        if (existingBanner) {
            fs.unlinkSync(req.file?.path);
            return res.status(409).json({ type: "warning", message: "Banner already exists!" });
        }

        if (existingBannerSequence) {
            fs.unlinkSync(req.file?.path);
            return res.status(202).json({ type: "warning", message: "Sequence already exists! Please add a different sequence." });
        }

        const banner = await Banner.findById(bannerId);

        if (!banner) {
            fs.unlinkSync(req.file?.path);
            return res.status(404).json({ type: "warning", message: "Banner does not exist!" });
        }

        if (ProductId === undefined || ProductId === "") {
        }
        else {
            banner.ProductId = await ProductId
        }

        banner.Banner_Name = Banner_Name;
        banner.Banner_Sequence = Banner_Sequence;
        banner.Banner_Label = Banner_Label;

        if (req.file) {
            // Delete the previous image file if it exists
            if (banner.Banner_Image && fs.existsSync(banner.Banner_Image.path)) {
                fs.unlinkSync(banner.Banner_Image.path);
            }

            // Update the image details
            const originalFilename = req.file.originalname;
            const extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
            const imageFilename = `${Banner_Name.replace(/\s/g, '_')}${extension}`;
            const imagePath = 'imageUploads/backend/productBanner/' + imageFilename;

            fs.renameSync(req?.file?.path, imagePath);

            banner.Banner_Image.filename = imageFilename;
            banner.Banner_Image.path = imagePath;
            banner.Banner_Image.originalname = originalFilename;
        }

        await banner.save();
        res.status(200).json({ type: "success", message: "Banner updated successfully!" });
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req?.file?.path);
        }
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
        console.log(error)
    }
});




module.exports = route