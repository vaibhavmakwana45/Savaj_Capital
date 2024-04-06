const express = require('express');
const router = express.Router();
const moment = require('moment');
const AddProject = require('../models/Addproject');
const AddUser = require('../models/AddUser');
// post
router.post('/addproject', async (req, res) => {
  try {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(5, 15);
    const randomNumber = Math.floor(Math.random() * Math.pow(10, 10))
      .toString()
      .padStart(10, '0');
    const uniqueId = `${timestamp}${randomString}${randomNumber}`;
    const userUniqueId = (req.body['project_id'] = uniqueId);
    const createTime = (req.body['createAt'] = moment().format('YYYY-MM-DD HH:mm:ss'));
    const updateTime = (req.body['updateAt'] = moment().format('YYYY-MM-DD HH:mm:ss'));

    const newProject = new AddProject({
      admin_id: req.body.admin_id,
      projectName: req.body.projectName,
      projectShortName: req.body.projectShortName,
      priority: req.body.priority,
      description: req.body.description,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      createAt: createTime,
      updateAt: updateTime,
      project_id: userUniqueId,
      fileUrl: req.body.fileUrl
    });

    await newProject.save();

    res.json({
      success: true,
      message: 'Project Add Successful'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.get('/projects/:adminId', async (req, res) => {
  try {
    const adminId = req.params.adminId;
    let projects = await AddProject.find({ admin_id: adminId });

    if (!projects || projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No projects found for the provided admin ID'
      });
    }

    projects = projects.reverse();

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.get('/projects/names/:adminId', async (req, res) => {
  try {
    const adminId = req.params.adminId;
    const projects = await AddProject.find({ admin_id: adminId }, 'projectName project_id');

    if (!projects || projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No projects found for the provided admin ID'
      });
    }

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.put('/editproject/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const updatedProject = await AddProject.findOneAndUpdate(
      { project_id: projectId },
      {
        $set: req.body,
        updateAt: moment().format('YYYY-MM-DD HH:mm:ss')
      },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.delete('/deleteproject/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const deletedProject = await AddProject.findOneAndDelete({ project_id: projectId });

    if (!deletedProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.get('/projects-with-user/:adminId', async (req, res) => {
  try {
    const adminId = req.params.adminId;
    let projects = await AddProject.find({ admin_id: adminId });

    if (!projects || projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No projects found for the provided admin ID'
      });
    }

    const projectsWithUsers = await Promise.all(
      projects.map(async (project) => {
        const users = await AddUser.find({ project_ids: project.project_id });

        return {
          ...project.toObject(),
          users: users.map((user) => ({
            user_id: user.user_id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email
          }))
        };
      })
    );

    const reversedProjectsWithUsers = projectsWithUsers.reverse();

    res.json({
      success: true,
      data: reversedProjectsWithUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.put('/update-project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const projectUpdates = req.body;

    const updatedProject = await AddProject.findOneAndUpdate({ project_id: projectId }, { $set: projectUpdates }, { new: true });
    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (projectUpdates.project_id) {
      const associatedUsers = await AddUser.find({ project_ids: projectId });

      const updates = associatedUsers.map(async (user) => {
        const updatedProjectIds = user.project_ids.map((pid) => (pid === projectId ? projectUpdates.project_id : pid));
        return await AddUser.findByIdAndUpdate(user._id, { $set: { project_ids: updatedProjectIds } }, { new: true });
      });

      await Promise.all(updates);
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

module.exports = router;
