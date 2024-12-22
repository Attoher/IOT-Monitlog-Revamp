const express = require('express')
const router = express.Router()
const sensorController = require('../controllers/sensor.controller')

// Latest readings endpoints
router.get('/temperature/latest', sensorController.getLatestTemperature)
router.get('/humidity/latest', sensorController.getLatestHumidity)
router.get('/power/latest', sensorController.getLatestPower)

// Historical data endpoints
router.get('/temperature/history', sensorController.getTemperatureHistory)
router.get('/humidity/history', sensorController.getHumidityHistory)
router.get('/power/history', sensorController.getPowerHistory)

module.exports = router
