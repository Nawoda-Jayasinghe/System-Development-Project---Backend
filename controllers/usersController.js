const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const generator = require("generate-password");
const nodemailer = require("nodemailer");

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  // Get all users from MongoDB
  const users = await User.find({ approval: true, deleted: false })
    .sort({ createdAt: -1 })
    .select("-password")
    .lean();

  // If no users
  if (!users?.length) {
    return res.json({ message: "No users found" });
  }

  res.json(users);
});

// @desc Get all users for tasks
// @route GET /users
// @access Private
const getAllUsersForTasks = asyncHandler(async (req, res) => {
  // Get all users from MongoDB
  const users = await User.find({ active: true })
    .select("_id firstName lastName")
    .lean();

  // If no users
  if (!users?.length) {
    return res.json({ message: "No users found", result: false });
  }

  res.json({ users, result: true });
});

// @desc Get all member requests
// @route GET /users
// @access Private
const getAllMemberRequests = asyncHandler(async (req, res) => {
  // Get all users from MongoDB
  const users = await User.find({
    active: false,
    deleted: false,
    approval: false,
  })
    .sort({ createdAt: -1 })
    .lean();

  // If no users
  if (!users?.length) {
    return res.json({ message: "No users found", result: false });
  }

  res.json(users);
});

// @desc Get specific user details
// @route GET /users
// @access Private
const getspecificUserDetails = asyncHandler(async (req, res) => {
  // Get all users from MongoDB
  const { id } = req.params;

  const user = await User.findById(id).select("-password").lean();

  // If no users
  if (!user) {
    return res.json({ message: "No user found", result: false });
  }

  res.json({ user, result: true });
});

// @desc test email
// @route GET /users
// @access Private
const emailTesting = asyncHandler(async (req, res) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "siyapatha.volunteers@gmail.com",
      pass: "sxxhfcwsrbjzamxb",
    },
  });

  let mailOptions = {
    from: "siyapatha.volunteers@gmail.com",
    to: "upendramalindu116@gmail.com",
    subject: "Thank you for you donation",
    text:
      "Dear Nawoda,\n\xA0 \n\xA0" +
      "Thank you for your generous gift to Siyapatha organization. We are thrilled to have your support." +
      " Through your donation we have been able to accomplish and continue working towards help poor people." +
      " You truly make the difference for us, and we are extremely grateful!\n\xA0 \n\xA0Today your donation is going toward the success." +
      " If you have specific questions about how your gift is being used or our organization as whole," +
      "please don’t hesitate to contact Nawoda Jayasinghe through +94 713 389 039.\n\xA0 \n\xA0" +
      "Sincerely,\n\xA0" +
      "Siyaptha Oraganization",
  };

  await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
});

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, city, birthDate, email, phone, password, role } =
    req.body;

  // Confirm data
  if (
    !firstName ||
    !lastName ||
    !city ||
    !birthDate ||
    !email ||
    !phone ||
    !password ||
    !role
  ) {
    return res.json({ message: "All fields are required", result: false });
  }

  // Check for duplicate username
  const duplicate = await User.findOne({ email })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate email", result: false });
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  // Create and store new user
  const user = await User.create({
    firstName,
    lastName,
    city,
    birthDate,
    email,
    phone,
    roles: role,
    message: null,
    password: hashedPwd,
    active: true,
    approval: true,
  });

  if (user) {
    //created
    res.json({ message: `New user ${firstName} created`, result: true });
  } else {
    res.json({ message: "Invalid user data received", result: false });
  }
});

// @desc Create new member
// @route POST /users
// @access Private
const createNewMember = asyncHandler(async (req, res) => {
  const { firstName, lastName, mobile, city, birthDate, email, message } =
    req.body;

  // Confirm data
  if (
    !firstName ||
    !lastName ||
    !city ||
    !birthDate ||
    !message ||
    !email ||
    !mobile
  )
    return res.json({
      message: "All fields except password are required",
      result: false,
    });

  // Check for duplicate username
  const duplicate = await User.findOne({ email })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.json({ message: "Email already exist", result: false });
  }

  // Create and store new user
  const user = await User.create({
    firstName,
    lastName,
    city,
    birthDate,
    email,
    phone: mobile,
    message,
    password: null,
  });

  if (user) {
    //sending email
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "siyapatha.volunteers@gmail.com",
        pass: "sxxhfcwsrbjzamxb",
      },
    });

    let mailOptions = {
      from: "Siyapatha",
      to: email,
      subject: "Thank you for your joining with us",
      text:
        "Dear " +
        firstName +
        " " +
        lastName +
        ",\n\xA0 \n\xA0Thank you for your registering into Siyapatha organization." +
        " We see your good intentions to join our organization. We will get back to you as soon as possible.\n\xA0 \n\xA0" +
        "Sincerely,\n\xA0" +
        "Siyaptha Oraganization",
    };

    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    //created
    res.json({ message: `New user ${firstName} created`, result: true });
  } else {
    res.json({ message: "Invalid user data received", result: false });
  }
});

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const {
    _id,
    firstName,
    lastName,
    city,
    birthDate,
    email,
    phone,
    roles,
    active,
  } = req.body;

  // Confirm data
  if (
    !_id ||
    !firstName ||
    !lastName ||
    !city ||
    !birthDate ||
    !email ||
    !phone ||
    !roles
  )
    return res.json({
      message: "All fields except password are required",
      result: false,
    });

  // Does the user exist to update?
  const user = await User.findById(_id).exec();

  if (!user) {
    return res.json({ message: "User not found", result: false });
  }

  user.firstName = firstName;
  user.lastName = lastName;
  user.city = city;
  user.birthDate = birthDate;
  user.email = email;
  user.phone = phone;
  user.roles = roles;
  user.active = active;

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.firstName} updated`, result: true });
});

// @desc Update member
// @route PATCH /users
// @access Private
const approveMember = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Confirm data
  if (!id)
    return res.status(400).json({
      message: "Id is required",
      result: false,
    });

  // Does the user exist to update?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found", result: false });
  }

  // // Hash password
  const password = generator.generate({
    length: 7,
    numbers: true,
    uppercase: true,
    lowercase: true,
  });
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  user.active = true;
  user.approval = true;
  user.password = hashedPwd;

  const updatedUser = await user.save();

  if (updateUser) {
    //sending email
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "siyapatha.volunteers@gmail.com",
        pass: "sxxhfcwsrbjzamxb",
      },
    });

    let mailOptions = {
      from: "siyapatha.volunteers@gmail.com",
      to: updatedUser.email,
      subject: "Siyapatha",
      text:
        "Hi " +
        updatedUser.firstName +
        ",\n\xA0\n\xA0" +
        "welcome! you are now a member of siyapatha oraganization. We are glad to have you.\n\xA0\n\xA0" +
        "here are your account details\n\xA0" +
        "Name:" +
        updatedUser.firstName +
        " " +
        updatedUser.lastName +
        "\n\xA0" +
        "Email:" +
        updatedUser.email +
        "\n\xA0\n\xA0" +
        "Membership Level: " +
        updatedUser.roles +
        "\n\xA0" +
        "You can log in at http://localhost:3000/login with following username and password\n\xA0" +
        "username: " +
        updatedUser.email +
        "\n\xA0" +
        "password: " +
        password +
        "\n\xA0\n\xA0" +
        "Regards,\n\xA0" +
        "Siyapatha Organization.",
    };

    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.json({ message: `${updatedUser.firstName} updated`, result: true });
  }
});

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { userid } = req.params;
  console.log(userid);

  // Confirm data
  if (!userid) {
    return res.json({ message: "User ID Required", result: false });
  }

  // Does the user exist to delete?
  const user = await User.findById(userid).exec();

  if (!user) {
    return res.json({ message: "User not found", result: false });
  }

  // Does the user still have assigned notes?
  const notes = await Note.find({ user: userid }).lean().exec();

  if (notes.length > 0) {
    notes.forEach((note) => {
      if (!note.completed) {
        return res.json({
          message: "User has assigned tasks",
          result: false,
        });
      }
    });
  }

  const result = await user.updateOne({ deleted: true, active: false });

  const reply = `Username ${result.firstName} with ID ${result._id} deleted`;

  res.json({ reply, result: true });
});

// when need to change the schema
const changeSchema = asyncHandler(async (req, res) => {
  const result = await User.updateMany({
    createdAt: "2023-01-01T08:12:57.227+00:00",
  });

  res.json(result);
});

module.exports = {
  getAllUsers,
  createNewUser,
  createNewMember,
  updateUser,
  deleteUser,
  emailTesting,
  getAllMemberRequests,
  approveMember,
  getAllUsersForTasks,
  getspecificUserDetails,
  changeSchema,
};
