const express = require("express");
const router = express.Router();
const projectsController = require("../controllers/projectController");

router
  .route("/")
  .get(projectsController.getAllProjects)
  .post(projectsController.createNewProject)
  .patch(projectsController.updateProject);

router
  .route("/getProjectsForTasks")
  .get(projectsController.getAllProjectsForTasks);

router.route("/:id").delete(projectsController.deleteProject);

module.exports = router;
