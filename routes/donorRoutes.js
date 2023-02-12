const express = require("express");
const router = express.Router();
const donorController = require("../controllers/donorController");

router
  .route("/")
  .get(donorController.getAllDonors)
  .post(donorController.createNewDonor)
  .patch(donorController.updateDonor)
  .delete(donorController.deleteDonor);

router.route("/createDonation").post(donorController.createDonations);

module.exports = router;
