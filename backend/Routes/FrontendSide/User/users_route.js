const express = require("express");
const route = express.Router();
const User = require("../../../Models/FrontendSide/user_model");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authMiddleWare = require("../../../Middleware/authMiddleWares");
const fs = require("fs");
const path = require("path");
const Coupon = require("../../../Models/FrontendSide/coupon_model");
const Charges = require("../../../Models/Settings/add_charges_model");
const {
  checkAdminWithMultRole123,
} = require("../../../Middleware/checkAdminWithMultRole");
const { transporter } = require("../../../utils/mailTransporter");

// Set up multer middleware to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./imageUploads/frontend/users");
  },
  filename: function (req, file, cb) {
    cb(null, file?.originalname);
  },
});
const upload = multer({ storage: storage });

// SIGNUP API
route.post("/user", async (req, res) => {
  try {
    const { name, email, password, phoneNumber, companyName } = req.body;

    // 1️⃣ Validation
    if (!name || !email || !password || !phoneNumber || !companyName) {
      return res.status(400).json({
        type: "error",
        message: "All fields are required",
      });
    }

    // 2️⃣ Check existing email
    const emailExists = await User.findOne({ User_Email: email });
    if (emailExists) {
      return res.status(400).json({
        type: "error",
        message: "Email already registered",
      });
    }

    // 3️⃣ Check existing phone
    const phoneExists = await User.findOne({
      User_Mobile_No: phoneNumber,
    });
    if (phoneExists) {
      return res.status(400).json({
        type: "error",
        message: "Phone number already registered",
      });
    }

    // 4️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Create user
    const newUser = new User({
      User_Name: name,
      User_Email: email,
      User_Password: hashedPassword,
      User_Mobile_No: phoneNumber,
      Company: companyName,
      User_Label: "User",
      User_Status: false,
    });

    await newUser.save();

    // 6️⃣ (Optional) JWT Token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_TOKEN, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      type: "success",
      message: "Signup successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.User_Name,
        email: newUser.User_Email,
        phone: newUser.User_Mobile_No,
        company: newUser.Company,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      type: "error",
      message: "Server error",
      errorMessage: error.message,
    });
  }
});

// LOGIN API
route.post("/login", async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;

    // 1️⃣ Validation
    if ((!email && !phoneNumber) || !password) {
      return res.status(400).json({
        type: "error",
        message: "Email/Phone and password are required",
      });
    }

    // 2️⃣ Find user by email OR phone
    const user = await User.findOne({
      $or: [{ User_Email: email }, { User_Mobile_No: phoneNumber }],
    });

    if (!user) {
      return res.status(400).json({
        type: "error",
        message: "User not found",
      });
    }

    // 3️⃣ Check if user is blocked
    if (user.Block === true) {
      return res.status(403).json({
        type: "error",
        message: "Your account is blocked. Please contact support.",
      });
    }

    // 4️⃣ Verify password
    const isMatch = await bcrypt.compare(password, user.User_Password);

    if (!isMatch) {
      return res.status(400).json({
        type: "error",
        message: "Invalid credentials",
      });
    }

    // 5️⃣ Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_TOKEN, {
      expiresIn: "7d",
    });

    // 6️⃣ Success response
    return res.status(200).json({
      type: "success",
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.User_Name,
        email: user.User_Email,
        phone: user.User_Mobile_No,
        company: user.Company,
        image: user.User_Image,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      type: "error",
      message: "Server error",
      errorMessage: error.message,
    });
  }
});

// get all the User
route.get("/get", async (req, res) => {
  const page = parseInt(req.query.page); // Current page number, default to 1
  const pageSize = parseInt(req.query.pageSize);

  try {
    // First, get the total count of documents for pagination
    const totalUsers = await User.countDocuments();
    const Users = await User.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    const populatedusers = Users.map((user) => {
      let User_Type = "";
      if (user?.User_Type === "0") {
        User_Type = "User";
      } else if (user?.User_Type === "1") {
        User_Type = "Gold";
      } else if (user?.User_Type === "2") {
        User_Type = "Silver";
      } else {
        User_Type = "PPO";
      }

      return {
        ...user.toObject(),
        User_Type: User_Type,
        userType: user?.User_Type,
      };
    });

    return res.status(200).json({
      type: "success",
      message: " User found successfully!",
      user: populatedusers,
      totalUsers,
      currentPage: page,
      pageSize,
    });
  } catch (error) {
    console.log("error ==> ", error);
    return res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// get all the user for dropdown
route.get("/get/alluser", checkAdminWithMultRole123, async (req, res) => {
  try {
    const user = await User.find({ User_Type: "0" }).sort({ createdAt: -1 });
    res.status(200).json({
      type: "success",
      message: " User found successfully!",
      user: user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// get all the reseller for dropdown
route.get("/get/allreseller", checkAdminWithMultRole123, async (req, res) => {
  try {
    const user = await User.find({ User_Type: { $ne: "0" } }).sort({
      createdAt: -1,
    });
    res.status(200).json({
      type: "success",
      message: " User found successfully!",
      user: user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// get the user profile
route.get("/profile/get", authMiddleWare, async (req, res) => {
  try {
    const userId = req?.user?.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(200)
        .json({ type: "error", message: " User not found!", user: [] });
    } else {
      let dummy = `${process.env.IP_ADDRESS}/imageUploads/frontend/users/profile-pic-dummy.png`;
      const User_Image =
        !user.User_Image?.path || user.User_Image?.path === "undefined"
          ? dummy
          : `${process.env.IP_ADDRESS}/${user.User_Image.path.replace(
              /\\/g,
              "/"
            )}` || "";

      const result = {
        _id: user?._id,
        User_Name: user?.User_Name || "",
        User_Image: User_Image,
        User_Email: user?.User_Email || "",
        User_Mobile_No: user?.User_Mobile_No || "",
        Block: user?.Block,
      };
      res.status(200).json({
        type: "success",
        message: "User found successfully!",
        user: result || [],
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// get user by token
route.get("/get", authMiddleWare, async (req, res) => {
  try {
    // Access the currently logged-in user details from req.user
    const userId = req?.user?.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(200).json({ type: "error", message: "User not found" });
    }

    res.status(200).json({ type: "success", user });
  } catch (error) {
    res.status(500).json({ type: "error", message: "Internal server error" });
    console.log(error);
  }
});

route.patch(
  "/profile/update",
  authMiddleWare,
  upload.single("image"),
  async (req, res) => {
    const userId = req.user.userId;
    const { name, email, mobileNumber } = req.body;

    const originalname = req.file?.originalname;

    try {
      const user = await User.findById(userId);

      if (!user)
        return res
          .status(404)
          .json({ type: "error", message: "User does not exist!" });

      user.User_Name = name || user.User_Name;
      user.User_Email = email || user.User_Email;
      user.User_Mobile_No = Number(mobileNumber) || user.User_Mobile_No;

      if (req.file) {
        const extension = path.extname(originalname);
        const imageFilename = `${user.User_Name}${user._id}${extension}`;
        const imagePath = `imageUploads/frontend/users/${imageFilename}`;

        // Rename the uploaded file
        fs.renameSync(req.file.path, imagePath); // Consider using fs.promises here

        user.User_Image.filename = imageFilename;
        user.User_Image.path = imagePath;
        user.User_Image.originalname = originalname;
      }

      await user.save();
      return res
        .status(200)
        .json({ type: "success", message: "User updated successfully!" });
    } catch (error) {
      console.error("Update profile error ==> ", error);
      if (req.file) fs.unlinkSync(req.file.path); // Ensure cleanup
      return res.status(500).json({
        type: "error",
        message: "Server Error!",
        errorMessage: error.message || error,
      });
    }
  }
);

//  function for generate coupon code
async function generateCouponCode(userName, userId) {
  const randomNumber =
    Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

  const timestamp = Date.now();

  const combinedString = userName + userId + randomNumber + timestamp;

  let hashCode = 0;
  for (let i = 0; i < combinedString.length; i++) {
    const char = combinedString.charCodeAt(i);
    hashCode = (hashCode << 5) - hashCode + char;
  }

  hashCode = Math.abs(hashCode);
  const couponCode = hashCode.toString().slice(-6);
  const newUserName = userName.slice(0, 4);

  return `${newUserName}${couponCode}`;
}

// Update User Profile and generate coupon
route.patch(
  "/profile/update/generate/coupon",
  authMiddleWare,
  upload.single("image"),
  async (req, res) => {
    const userId = req.user.userId;
    const { name, email, mobileNumber } = req.body;
    const originalname = req.file?.originalname;
    console.log("image-filessss", req?.file);
    console.log("name", name);
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ type: "error", message: "User does not exist!" });
      }

      if (mobileNumber && mobileNumber != user.User_Mobile_No) {
        const existingUserWithMobile = await User.findOne({
          User_Mobile_No: mobileNumber,
        });
        if (existingUserWithMobile) {
          return res.status(200).json({
            type: "error",
            message: "User Mobile Number already exists!",
          });
        }
      }

      user.User_Name = name || user.User_Name;
      user.User_Email = email || user.User_Email;
      user.User_Mobile_No = mobileNumber || user.User_Mobile_No;

      if (req.file) {
        const extension = path.extname(originalname);
        const imageFilename = `${user.User_Name}${user._id}${extension}`;
        const imagePath = `imageUploads/frontend/users/${imageFilename}`;

        fs.renameSync(req?.file?.path, imagePath);

        user.User_Image.filename = imageFilename;
        user.User_Image.path = imagePath;
        user.User_Image.originalname = originalname;
      }

      await user.save();

      // Generate and assign a coupon to the user
      const couponCode = await generateCouponCode(user.User_Name, user._id);

      const charges = await Charges.findOne();
      let coinsReward = charges?.coins_reward_user;

      let usageLimits = charges?.usage_limit_user;
      const discountAmount = charges?.Normal_Coup_Disc;

      // const discountAmount = 200;
      // const coinsReward = 200;
      const limit = usageLimits;
      const newCoupon = await new Coupon({
        couponCode,
        type: "0", // auto generated
        discountAmount,
        coinsReward,
        creationDate: new Date(),
        expiryDate: new Date(
          new Date().getFullYear() + 5,
          new Date().getMonth(),
          new Date().getDate()
        ), // Set expiry to 5 years later
        usageLimits: limit,
        createdBy: {
          type: "0", // user
          id: user._id,
        },
      });

      await newCoupon.save();
      console.log(newCoupon, "new");

      res.status(200).json({
        type: "success",
        message: "User updated successfully!",
        couponCode,
      });
    } catch (error) {
      if (req?.file) {
        fs.unlinkSync(req?.file?.path);
      }
      res
        .status(500)
        .json({ type: "error", message: "Server Error!", errorMessage: error });
      console.log(error);
    }
  }
);

// Update User Profile and generate coupon (for website)
route.put(
  "/profile/update/generate/coupon",
  authMiddleWare,
  upload.single("image"),
  async (req, res) => {
    const userId = req.user.userId;
    const { name, email, mobileNumber } = req.body;
    const originalname = req.file?.originalname;
    console.log("image-filessss", req?.file);
    console.log("name", name);
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ type: "error", message: "User does not exist!" });
      }

      if (mobileNumber && mobileNumber != user.User_Mobile_No) {
        const existingUserWithMobile = await User.findOne({
          User_Mobile_No: mobileNumber,
        });
        if (existingUserWithMobile) {
          return res.status(200).json({
            type: "error",
            message: "User Mobile Number already exists!",
          });
        }
      }

      user.User_Name = name || user.User_Name;
      user.User_Email = email || user.User_Email;
      user.User_Mobile_No = mobileNumber || user.User_Mobile_No;

      if (req.file) {
        const extension = path.extname(originalname);
        const imageFilename = `${user.User_Name}${user._id}${extension}`;
        const imagePath = `imageUploads/frontend/users/${imageFilename}`;

        fs.renameSync(req?.file?.path, imagePath);

        user.User_Image.filename = imageFilename;
        user.User_Image.path = imagePath;
        user.User_Image.originalname = originalname;
      }

      await user.save();

      // Generate and assign a coupon to the user
      const couponCode = await generateCouponCode(user.User_Name, user._id);

      const charges = await Charges.findOne();
      let coinsReward = charges?.coins_reward_user;

      let usageLimits = charges?.usage_limit_user;
      const discountAmount = charges?.Normal_Coup_Disc;

      // const discountAmount = 200;
      // const coinsReward = 200;
      const limit = usageLimits;
      const newCoupon = await new Coupon({
        couponCode,
        type: "0", // auto generated
        discountAmount,
        coinsReward,
        creationDate: new Date(),
        expiryDate: new Date(
          new Date().getFullYear() + 5,
          new Date().getMonth(),
          new Date().getDate()
        ), // Set expiry to 5 years later
        usageLimits: limit,
        createdBy: {
          type: "0", // user
          id: user._id,
        },
      });

      await newCoupon.save();
      console.log(newCoupon, "new");

      res.status(200).json({
        type: "success",
        message: "User updated successfully!",
        couponCode,
      });
    } catch (error) {
      if (req?.file) {
        fs.unlinkSync(req?.file?.path);
      }
      res
        .status(500)
        .json({ type: "error", message: "Server Error!", errorMessage: error });
      console.log(error);
    }
  }
);

// update user status (block or unblock)
route.patch(
  "/update/status/:id",
  checkAdminWithMultRole123,
  async (req, res) => {
    const UserId = await req.params.id;

    try {
      const { Block } = req.body;
      const newUser = await User.findByIdAndUpdate(UserId);
      newUser.Block = await Block;

      await newUser.save();
      res
        .status(200)
        .json({ type: "success", message: "User Status update successfully!" });
    } catch (error) {
      res
        .status(500)
        .json({ type: "error", message: "Server Error!", errorMessage: error });
    }
  }
);

// approve retailer from admin
route.patch("/update/byAdmin/:id", async (req, res) => {
  const userId = req.params.id;
  const { status } = req.body; // expected: "true" | "false" | etc.

  try {
    if (!status) {
      return res.status(400).json({
        type: "error",
        message: "Status is required",
      });
    }

    // update user & return updated document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { User_Status: status },
      { new: true } // IMPORTANT
    );

    if (!updatedUser) {
      return res.status(404).json({
        type: "error",
        message: "User not found!",
      });
    }

    /* ---------------- SEND MAIL ONLY IF APPROVED ---------------- */
    if (status === true) {
      const mailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Hello ${updatedUser.User_Name || "Retailer"},</h2>
          <p>🎉 Congratulations!</p>
          <p>Your retailer account has been <b>approved</b> by our admin team.</p>
          <p>You can now log in and start using all retailer features.</p>

          <br/>
          <p><b>Email:</b> ${updatedUser.User_Email}</p>

          <br/>
          <p>Regards,</p>
          <p><b>Team ${process.env.APP_NAME || "Xclusive Diamonds"}</b></p>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL,
        to: updatedUser.User_Email,
        subject: "Your Retailer Account Has Been Approved 🎉",
        html: mailHtml,
      });
    }

    return res.status(200).json({
      type: "success",
      message: "Retailer approved and approval mail sent.",
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: "error",
      message: "Server Error!",
      errorMessage: error.message,
    });
  }
});

// delete all user
route.delete("/deleteAll", checkAdminWithMultRole123, async (req, res) => {
  try {
    const users = await User.find();

    for (const user of users) {
      if (user.User_Image && fs.existsSync(user?.User_Image?.path)) {
        fs.unlinkSync(user?.User_Image?.path);
      }
    }

    await User.deleteMany();
    res
      .status(200)
      .json({ type: "error", message: "All Users deleted Successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// Delete many users
route.delete("/deletes", checkAdminWithMultRole123, async (req, res) => {
  try {
    const { ids } = req.body;
    console.log("ids ==> ", ids);
    const users = await User.find({ _id: { $in: ids } });

    for (const user of users) {
      if (user.User_Image && fs.existsSync(user?.User_Image?.path)) {
        fs.unlinkSync(user?.User_Image?.path);
      }
    }

    await User.deleteMany({ _id: { $in: ids } });
    res
      .status(200)
      .json({ type: "success", message: "All Users deleted successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// Delete User by ID
route.delete("/delete/:id", checkAdminWithMultRole123, async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ type: "error", message: "User not found!" });
    }

    if (user.User_Image && fs.existsSync(user?.User_Image?.path)) {
      fs.unlinkSync(user?.User_Image?.path);
    }

    await User.findByIdAndDelete(userId);
    return res
      .status(200)
      .json({ type: "success", message: "User deleted successfully!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// Delete User by user
route.delete("/account/delete", authMiddleWare, async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ type: "error", message: "User not found!" });
    } else {
      user.Block = true;
      await user.save();
      res
        .status(200)
        .json({ type: "success", message: "User deleted successfully!" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

module.exports = route;
