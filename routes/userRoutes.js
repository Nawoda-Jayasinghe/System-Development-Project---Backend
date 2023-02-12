const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')

router.route('/')
    .get(usersController.getAllUsers)
    .post(usersController.createNewUser)
    .patch(usersController.updateUser)
    
router.route('/:userid').delete(usersController.deleteUser)

router.route('/addNewMember').post(usersController.createNewMember)

router.route('/emailTesting').get(usersController.emailTesting)

router.route('/getMemberRequests').get(usersController.getAllMemberRequests)

router.route('/updateMember/:id').patch(usersController.approveMember)

router.route('/getUsersForTheTasks').get(usersController.getAllUsersForTasks)

router.route('/:id').get(usersController.getspecificUserDetails)

router.route('/updateSchema').patch(usersController.changeSchema)

module.exports = router
