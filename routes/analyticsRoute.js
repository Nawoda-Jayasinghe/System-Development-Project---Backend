const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

router.route("/getTotalDonationsForDashBoard").get(analyticsController.getTotalDonationsForDashBoard);

router.route("/getPeopleEngagementByProject").get(analyticsController.getPeopleEngagementByProject);

router.route("/getTaskCompletionMonthly").get(analyticsController.getTaskCompletionMonthly);

router.route("/getBudgetAchievingMonthly").get(analyticsController.getBudgetAchievingMonthly);

router.route("/getPeopleJoinedWithOrganization").get(analyticsController.getPeopleJoinedWithOrganization);

router.route("/getPeopleEngagementMonthly").get(analyticsController.getPeopleEngagementMonthly);

router.route("/getDonationCollectedDaily").get(analyticsController.getDonationCollectedDaily);

router.route("/getNumberOfPeopleDonated").get(analyticsController.getNumberOfPeopleDonated);

router.route("/getNumberOfPeopleMadeRequests").get(analyticsController.getNumberOfPeopleMadeRequests);

module.exports = router;
