'use strict'
const { asyncHandler } = require('../../auth/checkAuth')
const express = require('express')
const accessController = require('../../controllers/auth.controller')
const router = express.Router()

router.post('/auth/sign-up', asyncHandler(accessController.signUp))
router.post('/auth/login', asyncHandler(accessController.login))


module.exports = router