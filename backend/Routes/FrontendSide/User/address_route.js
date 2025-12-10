const express = require('express')
const route = express.Router()
const Address = require('../../../Models/FrontendSide/address_model')
const User = require('../../../Models/FrontendSide/user_model')
const authMiddleWare = require('../../../Middleware/authMiddleWares')
const checkAdminRole = require('../../../Middleware/adminMiddleWares')

// Create address
route.post('/add', authMiddleWare, async (req, res) => {
    try {
        const userId = req?.user?.userId
        const user = await User.findById(userId);
        const { Type, Name, Phone_Number, landmark, House, Full_Address, State, City, Lat, Lng, Pincode } = req.body
        if (!user) {
            return res.status(200).json({
                type: "error",
                message: 'User not found'
            });
        }

        const address = await new Address({
            userId: user._id,
            Type,
            Name,
            Phone_Number,
            landmark,
            House,
            Full_Address,
            State,
            City,
            Lat,
            Lng,
            Pincode
        });

        console.log("address from backend ==> ", address)

        
        await address.save()
        res.status(200).json({ type: "success", message: "Address add successfully!" })

    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error })
        console.log(error)
    }
});


// get all Address
route.get('/get', authMiddleWare, async (req, res) => {
    const userId = req.user?.userId
    try {
        const newAddress = await Address.find({ userId: userId, Status: true }).populate('userId', 'name').sort({ createdAt: -1 })
        if (newAddress.length <= 0) {
            res.status(200).json({ type: "success", message: "Address Not Found!", address: [] });
        }
        else {
            res.status(200).json({ type: "success", message: "Address found successfully!", address: newAddress});
        }

    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error })
        console.log(error)
    }
});



// get address by id
route.get('/get/:id', authMiddleWare, async (req, res) => {
    const addressId = req.params.id;
    try {
        const address = await Address.findById(addressId);
        res.status(200).json({ type: "success", message: " Address found successfully!", address: address || "" })

    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error })
    }
});


// delete all address
route.delete('/delete', checkAdminRole, async (req, res) => {

    try {
        await Address.deleteMany()
        res.status(200).json({ type: "error", message: "All Address deleted Successfully!" })

    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error })
    }
})


//  delete address by id
route.delete('/delete/:id', authMiddleWare, async (req, res) => {
    const addressId = await req.params.id
    try {
        let result = await Address.findByIdAndUpdate(addressId)
        if (!result) {
            return res.status(200).json({ type: "error", message: "Address not found!" })
        }
        result.Status = false
        await result.save()
        res.status(200).json({ type: "success", message: "Address deleted Successfully!" })

    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error })
    }
})


//  update address
route.patch('/update/:id', authMiddleWare, async (req, res) => {
    const addressId = await req.params.id

    const { Type, Name, Phone_Number, landmark, House, Full_Address, State, City, Lat, Lng, Pincode } = req.body

    try {

        const newAddress = await Address.findByIdAndUpdate(addressId);
        if (!newAddress) {
            return res.status(404).json({ type: "error", message: "Address does not exists!" });
        }

        newAddress.Type = Type
        newAddress.Name = Name
        newAddress.Phone_Number = Phone_Number
        newAddress.landmark = landmark
        newAddress.House = House
        newAddress.Full_Address = Full_Address
        newAddress.State = State
        newAddress.City = City
        newAddress.Lat = Lat
        newAddress.Lng = Lng
        newAddress.Pincode = Pincode

        await newAddress.save()
        res.status(200).json({ type: "success", message: "Address update successfully!" })

    } catch (error) {
        res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error })
        console.log(error)
    }
})


// // update only status 
// route.patch("/update/status/:id", async (req, res) => {

//     const AddressId = await req.params.id

//     try {
//         const { status } = req.body
//         const newAddress = await Address.findByIdAndUpdate(AddressId)
//         newAddress.status = await status

//         await newAddress.save()
//         res.status(200).json({ type: "success", message: "Address Status update successfully!" })

//     } catch (error) {
//         res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error })
//     }

// })

module.exports = route