const express = require("express");
const router = express.Router();
const predictionsController = require("../controllers/predictionsController");

router.route("/getBestProjectTypeToExecute").get(predictionsController.getBestProjectTypeToExecute);

router.route("/getBestMemberToAssignWork").get(predictionsController.getBestMemberToAssignWork);

router.route("/getBestDistrictToFocusForDonations").get(predictionsController.getBestDistrictToFocusForDonations);

router.route("/getBestCountryToFocusForDonations").get(predictionsController.getBestCountryToFocusForDonations);

module.exports = router;
