import Person from '../models/person.model.js';


export const getPersons = async (req, res) => {
  try {
    const persons = await Person.find({});
    res.json(persons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPersonById = async (req, res) => {
  try {
    const person = await Person.findById(req.params.id);
    
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    
    res.json(person);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPerson = async (req, res) => {
  try {
    // Convert separate birth date components to a single Date object
    if (req.body.birthMonth && req.body.birthDate && req.body.birthYear) {
      req.body.birthDate = new Date(
        parseInt(req.body.birthYear),
        parseInt(req.body.birthMonth) - 1, // JS months are 0-indexed
        parseInt(req.body.birthDate)
      );
    }
    
    // Remove individual birth date components from the request
    delete req.body.birthMonth;
    delete req.body.birthYear;
    
    const person = new Person(req.body);
    const createdPerson = await person.save();
    
    res.status(201).json(createdPerson);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
};


export const updatePerson = async (req, res) => {
  try {
    // Convert separate birth date components to a single Date object
    if (req.body.birthMonth && req.body.birthDate && req.body.birthYear) {
      req.body.birthDate = new Date(
        parseInt(req.body.birthYear),
        parseInt(req.body.birthMonth) - 1, // JS months are 0-indexed
        parseInt(req.body.birthDate)
      );
    }
    
    delete req.body.birthMonth;
    delete req.body.birthYear;
    
    const person = await Person.findById(req.params.id);
    
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    
    Object.assign(person, req.body);
    
    const updatedPerson = await person.save();
    res.json(updatedPerson);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
};

export const deletePerson = async (req, res) => {
  try {
    const person = await Person.findById(req.params.id);
    
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    
    await person.remove();
    res.json({ message: 'Person removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

