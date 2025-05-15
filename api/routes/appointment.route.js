import express from 'express';
import { 
  getAvailableTimeSlots,
  getIdTypes,
  createAppointment,
  getAppointment,
  cancelAppointment
} from '../controllers/appointment.controller.js';

const router = express.Router();

router.get('/timeslots/:date', getAvailableTimeSlots);
router.get('/id-types', getIdTypes);
router.post('/', createAppointment);
router.get('/:id', getAppointment);
router.put('/:id/cancel', cancelAppointment);

export default router;