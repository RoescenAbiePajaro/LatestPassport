import Logo from '../models/logo.model.js';


export const createLogo = async (req, res) => {
  try {
    const { userId, title, image, video } = req.body;
    

    const slug = slugify(title, { lower: true });
    
   
    const existingLogo = await Logo.findOne({ title });
    if (existingLogo) {
      return res.status(400).json({ message: 'Logo with this title already exists' });
    }
    
    const newLogo = new Logo({
      userId,
      title,
      slug,
      image: image || undefined,
      video: video || undefined
    });
    
    const savedLogo = await newLogo.save();
    res.status(201).json(savedLogo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAllLogos = async (req, res) => {
  try {
    const logos = await Logo.find().sort({ createdAt: -1 });
    res.status(200).json(logos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getLogoById = async (req, res) => {
  try {
    const logo = await Logo.findById(req.params.id);
    if (!logo) {
      return res.status(404).json({ message: 'Logo not found' });
    }
    res.status(200).json(logo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getLogosByUserId = async (req, res) => {
  try {
    const logos = await Logo.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(logos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateLogo = async (req, res) => {
  try {
    const { title, image, video } = req.body;
    
    const logoToUpdate = await Logo.findById(req.params.id);
    if (!logoToUpdate) {
      return res.status(404).json({ message: 'Logo not found' });
    }
    
    
    let slug = logoToUpdate.slug;
    if (title && title !== logoToUpdate.title) {
      const existingLogo = await Logo.findOne({ 
        title, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingLogo) {
        return res.status(400).json({ message: 'Logo with this title already exists' });
      }
      
      slug = slugify(title, { lower: true });
    }
    
    const updatedLogo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        title: title || logoToUpdate.title,
        slug,
        image: image || logoToUpdate.image,
        video: video || logoToUpdate.video
      },
      { new: true }
    );
    
    res.status(200).json(updatedLogo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteLogo = async (req, res) => {
  try {
    const logo = await Logo.findById(req.params.id);
    if (!logo) {
      return res.status(404).json({ message: 'Logo not found' });
    }
    
    await Logo.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Logo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};