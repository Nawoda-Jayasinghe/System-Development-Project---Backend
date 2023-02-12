const Donation = require("../models/Donation");
const Project = require("../models/Project");
const Note = require("../models/Note");
const User = require("../models/User");

// @desc Get insights for best project type to execute
// @route GET /getBestProjectTypeToExecute
// @access Private
const getBestProjectTypeToExecute = async (req, res) => {
  // Get all projects from MongoDB
  const projectCategory = await Project.aggregate([
    {
      $group: {
        _id: "$projectCategory",
      },
    },
  ]);

  const donations = await Donation.find().populate("project");

  const projects = await Project.find();

  let processedData = [];

  projectCategory.forEach((category) => {
    let totalDonations = 0;
    let expectedBudget = 0;
    donations.forEach((donation) => {
      if (category._id === donation.project.projectCategory) {
        totalDonations += totalDonations + donation.donationAmount;
      }
    });

    projects.forEach((project) => {
      if (category._id === project.projectCategory) {
        expectedBudget += expectedBudget + parseInt(project.budget);
      }
    });

    let percentageForDonations = 0;
    percentageForDonations = expectedBudget / 100.0;
    let donorEnagement = totalDonations / percentageForDonations;
    donorEnagement = donorEnagement.toFixed(1);

    if (donorEnagement > 100.0) {
      donorEnagement = "100";
    }

    processedData.push({
      projectType: category._id,
      donations: totalDonations,
      expectedAmount: expectedBudget,
      donorEnagement,
    });
  });

  processedData.sort(function (a, b) {
    return b.donorEnagement - a.donorEnagement;
  });

  res.json({ processedData, result: true });
};

// @desc Get insights for best member to assign work
// @route GET /getBestProjectTypeToExecute
// @access Private
const getBestMemberToAssignWork = async (req, res) => {
  const users = await User.find({ deleted: false, approval: true });

  const tasks = await Note.find().populate("user");

  let processedData = [];

  users.forEach((user) => {
    let countOfCompletedTasks = 0;
    let countOfPendingTasks = 0;

    tasks.forEach((task) => {
      task.user.forEach((tUser) => {
        if (user._id.toString() === tUser._id.toString()) {
          if (task.completed) {
            countOfCompletedTasks += 1;
          } else {
            countOfPendingTasks += 1;
          }
        }
      });
    });

    processedData.push({
      user: user.firstName + " " + user.lastName,
      countOfCompletedTasks,
      countOfPendingTasks,
    });
  });

  processedData.forEach((data, index) => {
    if (data.countOfCompletedTasks === 0 && data.countOfPendingTasks === 0) {
      delete processedData[index];
    }
  });

  processedData.forEach((data, index) => {
    let totalTasks = data.countOfCompletedTasks + data.countOfPendingTasks;
    const finalPercentage = totalTasks / 100.0;
    data.countOfCompletedTasks = data.countOfCompletedTasks / finalPercentage;
    data.countOfCompletedTasks.toFixed(0);
    data.countOfPendingTasks = data.countOfPendingTasks / finalPercentage;
    data.countOfPendingTasks.toFixed(0);
  });

  processedData = processedData.filter((data) => data !== null);

  processedData.sort(function (a, b) {
    return b.countOfCompletedTasks - a.countOfCompletedTasks;
  });

  res.json({ processedData, result: true });
};

// @desc Get insights for best district to focus for donations
// @route GET /getBestDistrictToFocusForDonations
// @access Private
const getBestDistrictToFocusForDonations = async (req, res) => {
  let processedData = [];

  processedData.push({
    district: "Colombo",
    donorEnagement: 86,
  });

  processedData.push({
    district: "Kandy",
    donorEnagement: 56,
  });

  processedData.push({
    district: "Matara",
    donorEnagement: 26,
  });

  res.json({ processedData, result: true });
};

// @desc Get insights for best country to focus for donations
// @route GET /getBestCountryToFocusForDonations
// @access Private
const getBestCountryToFocusForDonations = async (req, res) => {
  let processedData = [];

  processedData.push({
    country: "Sri Lanka",
    donorEnagement: 86,
  });

  processedData.push({
    country: "Australia",
    donorEnagement: 56,
  });

  processedData.push({
    country: "Singapore",
    donorEnagement: 26,
  });

  res.json({ processedData, result: true });
};

module.exports = {
  getBestProjectTypeToExecute,
  getBestMemberToAssignWork,
  getBestDistrictToFocusForDonations,
  getBestCountryToFocusForDonations,
};
