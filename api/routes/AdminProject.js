const express = require('express');
const router = express.Router();
const Project = require('../models/AdminProject');
const moment = require('moment');

// Endpoint to save image path and URL
router.post('/project', async (req, res) => {
  const { image, url } = req.body;
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substr(5, 15);
  const randomNumber = Math.floor(Math.random() * Math.pow(10, 10))
    .toString()
    .padStart(10, '0');
  const uniqueId = `${timestamp}${randomString}${randomNumber}`;
  const projectUniqueId = (req.body['project_id'] = uniqueId);
  const createTime = (req.body['createAt'] = moment().format('YYYY-MM-DD HH:mm:ss'));
  const updateTime = (req.body['updateAt'] = moment().format('YYYY-MM-DD HH:mm:ss'));

  if (!image || !url) {
    return res.status(400).json({ message: 'Image path and URL are required' });
  }

  try {
    const newProject = new Project({
      image,
      url,
      createAt: createTime,
      updateAt: updateTime,
      project_id: projectUniqueId,
    });

    const savedProject = await newProject.save();

    res.status(201).json(savedProject);
  } catch (error) {
    console.error('Error saving the project:', error);
    res.status(500).json({ message: 'Failed to save the project' });
  }
});

// Endpoint to get all projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find(); // Use .find() with no arguments to retrieve all documents
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// Endpoint to delete a project using project_id
router.delete('/project/:project_id', async (req, res) => {
  const { project_id } = req.params; // Extract project_id from URL parameters

  if (!project_id) {
    return res.status(400).json({ message: 'Project ID is required' });
  }

  try {
    const deletedProject = await Project.findOneAndDelete({ project_id: project_id });

    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ message: 'Project deleted successfully', deletedProject });
  } catch (error) {
    console.error('Error deleting the project:', error);
    res.status(500).json({ message: 'Failed to delete the project' });
  }
});

module.exports = router;
