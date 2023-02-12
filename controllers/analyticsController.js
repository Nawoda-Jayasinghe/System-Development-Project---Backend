const Donation = require("../models/Donation");
const Project = require("../models/Project");
const Note = require("../models/Note");
const User = require("../models/User");

// @desc getting donations for each project
// @route GET /getTotalDonationsForDashBoard
// @access Public
const getTotalDonationsForDashBoard = async (req, res) => {
  // Get all notes from MongoDB
  const donations = await Donation.find().populate("project").lean();

  if (donations.length === 0) {
    return res.json({ message: "No donations found", result: false });
  }

  // Get all projects from MongoDB
  const projects = await Project.find().select("_id title budget").lean();

  let processedData = [];

  projects.forEach((project) => {
    let specificProjectDonations = 0;

    donations.forEach((donation) => {
      if (project._id.toString() === donation.project._id.toString()) {
        specificProjectDonations += donation.donationAmount;
      }
    });

    processedData.push({
      title: project.title,
      total: specificProjectDonations,
      target: parseInt(project.budget),
    });
  });

  return res.json({ collected: processedData, result: true });
};

// @desc getting donations for each project category
// @route GET/ getPeopleEngagementByProject
// @access Public
const getPeopleEngagementByProject = async (req, res) => {
  // Get all notes from MongoDB
  const donations = await Donation.find().populate("project").lean();

  if (donations.length === 0) {
    return res.json({ message: "No donations found", result: false });
  }

  // Get all projects from MongoDB
  const projectCategory = await Project.aggregate([
    {
      $group: {
        _id: "$projectCategory",
      },
    },
  ]);

  let processedData = [];

  projectCategory.forEach((project) => {
    let specificProjectDonations = 0;
    donations.forEach((donation) => {
      if (project._id === donation.project.projectCategory) {
        specificProjectDonations += donation.donationAmount;
      }
    });

    processedData.push({
      title: project._id,
      total: specificProjectDonations,
    });
  });

  return res.json({
    processedData,
    label: "People Engagement By Project",
    result: true,
  });
};

// @desc getting donations for each project category
// @route GET/ getTaskCompletionMonthly
// @access Public
const getTaskCompletionMonthly = async (req, res) => {
  const months = [
    { month: "January", number: 0 },
    { month: "February", number: 1 },
    { month: "March", number: 2 },
    { month: "April", number: 3 },
    { month: "May", number: 4 },
    { month: "June", number: 5 },
    { month: "July", number: 6 },
    { month: "August", number: 7 },
    { month: "September", number: 8 },
    { month: "October", number: 9 },
    { month: "November", number: 10 },
    { month: "December", number: 11 },
  ];

  const tasks = await Note.find().lean();

  let processedData = [];

  months.forEach((month) => {
    let completedTasks = 0;
    let pendingTasks = 0;
    tasks.forEach((task) => {
      const date = new Date(task.createdAt);
      if (date.getMonth() === month.number) {
        if (task.completed) {
          completedTasks += 1;
        } else {
          pendingTasks += 1;
        }
      }
    });

    processedData.push({
      month: month.month,
      completedTasks,
      pendingTasks,
    });
  });

  return res.json({
    processedData,
    datasetOne: "Completed tasks",
    datasetTwo: "Open tasks",
    label: "Task completion monthly",
    result: true,
  });
};

// @desc getting estimations and collected for each project category
// @route GET/ getBudgetAchievingMonthly
// @access Public
const getBudgetAchievingMonthly = async (req, res) => {
  const processedData = [
    {
      month: "January",
      completedTasks: 65,
      pendingTasks: 28,
    },
    {
      month: "February",
      completedTasks: 59,
      pendingTasks: 48,
    },
    {
      month: "March",
      completedTasks: 90,
      pendingTasks: 40,
    },
    {
      month: "April",
      completedTasks: 81,
      pendingTasks: 19,
    },
    {
      month: "May",
      completedTasks: 56,
      pendingTasks: 96,
    },
    {
      month: "June",
      completedTasks: 55,
      pendingTasks: 27,
    },
    {
      month: "July",
      completedTasks: 40,
      pendingTasks: 100,
    },
  ];

  return res.json({
    processedData,
    datasetOne: "Estimated amount",
    datasetTwo: "Collected amount",
    label: "Budget achieveing monthly",
    result: true,
  });
};

// @desc getting estimations and collected for each project category
// @route GET/ getPeopleJoinedWithOrganization
// @access Public
const getPeopleJoinedWithOrganization = async (req, res) => {
  let processedData = [];

  // Get all projects from MongoDB
  const cities = await User.aggregate([
    {
      $group: {
        _id: "$city",
      },
    },
  ]);

  const users = await User.find().lean();

  cities.forEach((a) => {
    let memberCount = 0;
    users.forEach((b) => {
      if (
        a._id.toString().toLowerCase().trim() ===
        b.city.toString().toLowerCase().trim()
      ) {
        memberCount += 1;
      }
    });

    processedData.push({
      city: a._id,
      memberCount,
    });
  });

  return res.json({
    processedData,
    label: "People joined with organization",
    result: true,
  });
};

// @desc getting people engagement monthly
// @route GET/ getPeopleEngagementMonthly
// @access Public
const getPeopleEngagementMonthly = async (req, res) => {
  const months = [
    { month: "January", number: 0 },
    { month: "February", number: 1 },
    { month: "March", number: 2 },
    { month: "April", number: 3 },
    { month: "May", number: 4 },
    { month: "June", number: 5 },
    { month: "July", number: 6 },
    { month: "August", number: 7 },
    { month: "September", number: 8 },
    { month: "October", number: 9 },
    { month: "November", number: 10 },
    { month: "December", number: 11 },
  ];

  const donations = await Donation.find().lean();

  const memberRequests = await User.find({ approval: false }).lean();

  let processedData = [];

  months.forEach((month) => {
    let sumOfDonation = 0;
    let totalRequests = 0;

    donations.forEach((donation) => {
      const date = new Date(donation.createdAt);
      if (date.getMonth() === month.number) {
        sumOfDonation += donation.donationAmount;
      }
    });

    memberRequests.forEach((request) => {
      const date = new Date(request.createdAt);
      if (date.getMonth() === month.number) {
        totalRequests += 1;
      }
    });

    processedData.push({
      month: month.month,
      requests: totalRequests,
      donation: sumOfDonation,
    });
  });

  return res.json({
    processedData,
    result: true,
  });
};

// @desc getting donations collected daily
// @route GET/ getDonationCollectedDaily
// @access Public
const getDonationCollectedDaily = async (req, res) => {
  const donationDays = await Donation.aggregate([
    {
      $group: {
        _id: "$day",
      },
    },
  ]);

  donationDays.sort((a, b) => {
    if (a._id < b._id) {
      return -1;
    }
    if (a._id > b._id) {
      return 1;
    }
    return 0;
  });

  const donations = await Donation.find().lean();

  let processedData = [];

  donationDays.forEach((dDay) => {
    let sumOfDonations = 0;
    donations.forEach((donation) => {
      if (dDay._id === donation.day) {
        sumOfDonations += donation.donationAmount;
      }
    });

    processedData.push({
      y: dDay._id,
      x: sumOfDonations,
    });
  });

  return res.json({
    collected: processedData,
    label: "Amount of money collected",
    result: true,
  });
};

// @desc getting number of people donated
// @route GET/ getNumberOfPeopleDonated
// @access Public
const getNumberOfPeopleDonated = async (req, res) => {
  const donationDays = await Donation.aggregate([
    {
      $group: {
        _id: "$day",
      },
    },
  ]);

  donationDays.sort((a, b) => {
    if (a._id < b._id) {
      return -1;
    }
    if (a._id > b._id) {
      return 1;
    }
    return 0;
  });

  const donations = await Donation.find().lean();

  let processedData = [];

  donationDays.forEach((dDay) => {
    let sumOfDonations = 0;
    donations.forEach((donation) => {
      if (dDay._id === donation.day) {
        sumOfDonations += 1;
      }
    });

    processedData.push({
      y: dDay._id,
      x: sumOfDonations,
    });
  });

  return res.json({
    collected: processedData,
    label: "Number of people made donations",
    result: true,
  });
};

// @desc getting number of people made requests
// @route GET/ getNumberOfPeopleMadeRequests
// @access Public
const getNumberOfPeopleMadeRequests = async (req, res) => {
  let userRequestsDays = [];
  const users = await User.find().lean();

  users.forEach((user) => {
    const date = new Date(user.createdAt);
    user.createdAt = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
    userRequestsDays.push(date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate());
  });

  // to get the unique dates
  userRequestsDays = userRequestsDays.filter((x, i, a) => a.indexOf(x) === i)

  userRequestsDays.sort(function(a, b){return b - a})

  let processedData = [];

  userRequestsDays.forEach((dDay) => {
    let sumOfRequests = 0;
    users.forEach((user) => {
      if (dDay.toString() === user.createdAt.toString()) {
        sumOfRequests += 1;
      }
    });

    processedData.push({
      y: dDay.toString(),
      x: sumOfRequests,
    });
  });

  return res.json({
    collected: processedData,
    label: "Number of people made requests",
    result: true,
  });
};

module.exports = {
  getTotalDonationsForDashBoard,
  getPeopleEngagementByProject,
  getTaskCompletionMonthly,
  getBudgetAchievingMonthly,
  getPeopleJoinedWithOrganization,
  getPeopleEngagementMonthly,
  getDonationCollectedDaily,
  getNumberOfPeopleDonated,
  getNumberOfPeopleMadeRequests,
};
