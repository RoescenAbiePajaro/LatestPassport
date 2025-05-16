import express from 'express';
import {
  getPersons,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson
} from '../controllers/person.controller.js';

const router = express.Router();

// Get all persons
router.get('/', getPersons);
router.get('/:id', getPersonById);
router.post('/', createPerson);
router.put('/:id', updatePerson);
router.delete('/:id', deletePerson);

export default router;