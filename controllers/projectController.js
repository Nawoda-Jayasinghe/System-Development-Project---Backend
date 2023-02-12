const Project = require("../models/Project");
const User = require("../models/User");
const Donation = require("../models/Donation");
const Note = require("../models/Note");
const cloudinary = require("../utils/cloudinary");

// @desc Get all projects
// @route GET /projects
// @access Private
const getAllProjects = async (req, res) => {
  // Get all projects from MongoDB
  const projects = await Project.find().sort({ createdAt: -1 }).lean();

  // If no projects
  if (!projects?.length) {
    return res.status(400).json({ message: "No projects found" });
  }

  const tasks = await Note.find().lean();
  const donations = await Donation.find().lean();

  // getting the percentage for task completion
  projects.map((project) => {
    let specificTasks = [];
    tasks.map((task) => {
      if (project._id.toString() === task.project.toString()) {
        specificTasks.push(task);
      }
    });

    let completedTasks = [];
    let totalTasks = specificTasks.length;

    if (specificTasks.length > 0) {
      specificTasks.map((task) => {
        if (task.completed === true) {
          completedTasks.push(task);
        }
      });

      if (completedTasks.length > 0) {
        const percentageForTasks = totalTasks / 100.0;
        // adding percenatage of task completion into each project
        project.percentage = completedTasks.length / percentageForTasks;
        if (project.percentage !== 100) {
          project.percentage = project.percentage.toFixed(0);
        }
      } else {
        project.percentage = 0;
      }
    } else {
      project.percentage = 0;
    }

    specificTasks = [];

    // sum of donations
    let summationOfDonations = 0;

    donations.map((donation) => {
      if (project._id.toString() === donation.project.toString()) {
        summationOfDonations += donation.donationAmount;
      }
    });

    project.donations = summationOfDonations;

    // donor engagement calculations
    const percentageForDonations = project.budget / 100.0;
    project.donorEnagement = summationOfDonations / percentageForDonations;
    project.donorEnagement = project.donorEnagement.toFixed(1);

    summationOfDonations = 0;
  });

  res.json(projects);
};

// @desc Get all projects for tasks
// @route GET /projects
// @access Private
const getAllProjectsForTasks = async (req, res) => {
  // Get all projects from MongoDB
  const projects = await Project.find({ completed: false })
    .select("_id title")
    .lean();

  // If no projects
  if (!projects?.length) {
    return res.status(400).json({ message: "No projects found" });
  }

  // const projectsWithUser = await Promise.all(projects.map(async (project) => {
  //     const user = await User.findById(project.user).lean().exec()
  //     return { ...project, username: user.username }
  // }))

  res.json({ projects, result: true });
};

// @desc Create new project
// @route POST /projects
// @access Private
const createNewProject = async (req, res) => {
  const {
    projectName,
    description,
    budget,
    file,
    startingDate,
    endingDate,
    projectCategory,
  } = req.body;

  // Confirm data
  if (
    !projectName ||
    !description ||
    !budget ||
    !startingDate ||
    !endingDate ||
    !projectCategory
  ) {
    return res.json({ message: "All fields are required", result: false });
  }

  // Check for duplicate title
  const duplicate = await Project.findOne({ title: projectName })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.json({ message: "Duplicate project title", result: false });
  }

  const result = await cloudinary.uploader.upload(file, {
    folder: "projects",
    // width: 439,
    // crop: 'scale'
  });

  // Create and store the new user
  const project = await Project.create({
    title: projectName,
    description,
    budget,
    startingDate,
    endingDate,
    projectCategory,
    imgURL: result.secure_url,
  });

  if (project) {
    // Created
    return res.json({ message: "New project created", result: true });
  } else {
    return res.json({
      message: "Invalid project data received",
      result: false,
    });
  }
};

// @desc Update a project
// @route PATCH /projects
// @access Private
const updateProject = async (req, res) => {
  const {
    _id,
    title,
    budget,
    completed,
    startingDate,
    endingDate,
    projectCategory,
  } = req.body;

  // Confirm data
  if (
    !_id ||
    !title ||
    !budget ||
    !startingDate ||
    !endingDate ||
    !projectCategory
  ) {
    return res.json({ message: "All fields are required", result: false });
  }

  // Confirm project exists to update
  const project = await Project.findById(_id).exec();

  if (!project) {
    return res.json({ message: "Project not found", result: false });
  }

  // Check for duplicate title
  const duplicate = await Project.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow renaming of the original project
  if (duplicate && duplicate?._id.toString() !== _id) {
    return res.json({ message: "Duplicate project title", result: false });
  }

  project.title = title;
  project.completed = completed;
  project.budget = budget;
  project.startingDate = startingDate;
  project.endingDate = endingDate;
  project.projectCategory = projectCategory;

  const updatedProject = await project.save();

  res.json({ message: `'${updatedProject.title}' updated`, result: true });
};

// @desc Delete a project
// @route DELETE /projects
// @access Private
const deleteProject = async (req, res) => {
  const { id } = req.params;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Project ID required", result:false });
  }

  // Confirm project exists to delete
  const project = await Project.findById(id).exec();

  if (!project) {
    return res.status(400).json({ message: "Project not found", result:false });
  }

  const tasks = await Note.find({project:id}).exec();

  if(tasks.length > 0){
    await Note.deleteMany({project:id});
  }

  const result = await project.deleteOne();

  const reply = `Project '${result.title}' with ID ${result._id} deleted`;

  res.json({reply, result:true });
};

module.exports = {
  getAllProjects,
  createNewProject,
  updateProject,
  deleteProject,
  getAllProjectsForTasks,
};
