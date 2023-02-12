const Donor = require("../models/Donor");
const Donation = require("../models/Donation");
const Project = require("../models/Project");
const nodemailer = require("nodemailer");

// @desc Get all donors
// @route GET /donors
// @access Private
const getAllDonors = async (req, res) => {
  // Get all donors from MongoDB
  const donations = await Donation.find().sort({createdAt: -1}).populate("project").lean();

  // If no donors
  if (!donations?.length) {
    return res.json({ message: "No donations found", result:false });
  }

  res.json({donations, result:true});
};

// @desc Create new donor
// @route POST /donors
// @access Private
const createNewDonor = async (req, res) => {
  const { donorName, project, email, amount } = req.body;

  // Confirm data
  if (!donorName || !project || !email || !amount) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate title
  const duplicate = await Donor.findOne({ donorName })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate donor title" });
  }

  // Create and store the new project
  const donor = await Donor.create({ donorName, project, email, amount });

  if (donor) {
    // Created
    return res.status(201).json({ message: "New donor created" });
  } else {
    return res.status(400).json({ message: "Invalid donor data received" });
  }
};

// @desc Update a donor
// @route PATCH /donors
// @access Private
const updateDonor = async (req, res) => {
  const { id, donorName, project, email, amount } = req.body;

  // Confirm data
  if (!id || !donorName || !project || !email || !amount) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Confirm donor exists to update
  const donor = await Donor.findById(id).exec();

  if (!donor) {
    return res.status(400).json({ message: "Donor not found" });
  }

  // Check for duplicate title
  const duplicate = await Donor.findOne({ donorName })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow renaming of the original donor
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate donor title" });
  }

  donor.donorName = donorName;
  donor.project = project;
  donor.email = email;
  donor.amount = amount;

  const updatedDonor = await donor.save();

  res.json(`'${updatedDonor.donorName}' updated`);
};

// @desc Delete a donor
// @route DELETE /donors
// @access Private
const deleteDonor = async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Donor ID required" });
  }

  // Confirm donor exists to delete
  const donor = await Donor.findById(id).exec();

  if (!donor) {
    return res.status(400).json({ message: "Donor not found" });
  }

  const result = await donor.deleteOne();

  const reply = `Donor '${result.donorName}' with ID ${result._id} deleted`;

  res.json(reply);
};

// @desc Create new donor
// @route POST /donations
// @access Private
const createDonations = async (req, res) => {
  const {
    address,
    donationAmount,
    email,
    name,
    message,
    mobile,
    project,
    city,
    country,
    paymentMethod,
  } = req.body;

  // Confirm data
  if (
    !address ||
    !donationAmount ||
    !email ||
    !name ||
    !message ||
    !mobile ||
    !project ||
    !city ||
    !country ||
    !paymentMethod
  ) {
    return res.json({ message: "All fields are required", result: false });
  }

  const year = new Date().getFullYear();
  let month = new Date().getMonth();
  const day = new Date().getDate();

  // Create and store the donation
  const donor = await Donation.create({
    donorName: name,
    email,
    mobile,
    address,
    project,
    city,
    country,
    year,
    month: month + 1,
    day,
    paymentMethod,
    donationAmount,
  });

  if (donor) {
    //sending email
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "siyapatha.volunteers@gmail.com",
        pass: "sxxhfcwsrbjzamxb",
      },
    });

    let mailOptions = {
      from: "sliit.conference2021@gmail.com",
      to: email,
      subject: "Thank you for you donation",
      text:
        "Dear " + name +
        ",\n\xA0\n\xA0Thank you for your generous gift to Siyapatha organization. We are thrilled to have your support." +
        " Through your donation we have been able to accomplish [goal] and continue working towards help poor people." +
        " You truly make the difference for us, and we are extremely grateful!\n\xA0\n\xA0Today your donation is going toward [problem]." +
        " If you have specific questions about how your gift is being used or our organization as whole," +
        " please don’t hesitate to contact Nawoda Jayasinghe through +94 761 123 1234.\n\xA0\n\xA0" +
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

    // Created
    return res.json({ message: "New Donation created", result: true });
  } else {
    return res.json({
      message: "Invalid donation data received",
      result: false,
    });
  }
};

module.exports = {
  getAllDonors,
  createNewDonor,
  updateDonor,
  deleteDonor,
  createDonations,
};
