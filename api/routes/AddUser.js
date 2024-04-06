const express = require('express');
const router = express.Router();
const moment = require('moment');
const AddUser = require('../models/AddUser');
const AddProject = require('../models/Addproject');
const { hashPassword, hashCompare, createToken } = require('../utils/authhelper');

router.post('/adduser', async (req, res) => {
  try {
    const { email, phonenumber } = req.body;

    const existingUser = await AddUser.findOne({
      $or: [{ email: email }, { phonenumber: phonenumber }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(401).json({
          success: false,
          message: 'Email already in use'
        });
      } else if (existingUser.phonenumber === phonenumber) {
        return res.status(402).json({
          success: false,
          message: 'Phone number already in use'
        });
      }
    }
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(5, 15);
    const randomNumber = Math.floor(Math.random() * Math.pow(10, 10))
      .toString()
      .padStart(10, '0');
    const uniqueId = `${timestamp}${randomString}${randomNumber}`;
    const userUniqueId = (req.body['user_id'] = uniqueId);
    const createTime = (req.body['createAt'] = moment().format('YYYY-MM-DD HH:mm:ss'));
    const updateTime = (req.body['updateAt'] = moment().format('YYYY-MM-DD HH:mm:ss'));
    const hashedPassword = await hashPassword(req.body.password);
    const { project_ids } = req.body;
    const { projectNames } = req.body;
    
    const newUser = new AddUser({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      companyname: req.body.companyname,
      email: req.body.email,
      phonenumber: req.body.phonenumber,
      projectNames: projectNames || [],
      project_ids: project_ids || [],
      admin_id: req.body.admin_id,
      password: hashedPassword,
      createAt: createTime,
      updateAt: updateTime,
      user_id: userUniqueId
    });

    await newUser.save();

    res.json({
      success: true,
      message: 'User SignUp Successful',
      user_id: newUser.user_id // Include the generated user_id in the response
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.get('/getusers', async (req, res) => {
  try {
    const users = await AddUser.find({}, '-password');
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.get('/getuserbyadmin/:adminId', async (req, res) => {
  try {
    const adminId = req.params.adminId;
    let users = await AddUser.find({ admin_id: adminId }, '-password');
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found for this admin'
      });
    }

    // Reverse the users array
    users = users.reverse();

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.post('/userlogin', async (req, res) => {
  try {
    const user = await AddUser.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User does not exist'
      });
    }

    const compare = await hashCompare(req.body.password, user.password);

    if (!compare) {
      return res.status(422).json({
        success: false,
        message: 'Wrong password'
      });
    }

    const { token, expiresIn } = await createToken(user);

    res.json({
      success: true,
      data: user,
      expiresAt: expiresIn,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error
    });
  }
});

router.put('/updateuser/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const user = await AddUser.findOneAndUpdate({ user_id: userId }, { $set: updateData }, { new: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userResponse = { ...user._doc };
    delete userResponse.password;

    res.json({
      success: true,
      message: 'User updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.delete('/deleteuser/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const deletedUser = await AddUser.findOneAndDelete({ user_id: userId });

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
      deletedUserId: userId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.put('/edituser/:userId', async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;

  try {
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const updatedUser = await AddUser.findOneAndUpdate({ user_id: userId }, updates, { new: true, runValidators: true }).select(
      '-password'
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User data updated successfully',
      admin: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.get('/getprojects/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await AddUser.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const projects = await AddProject.find({
      project_id: { $in: user.project_ids }
    });

    res.json({
      success: true,
      projects
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.put('/updateuserprojects/:userId', async (req, res) => {
  const { userId } = req.params;
  const { addProjectIds, removeProjectIds } = req.body;

  try {
    if (!Array.isArray(addProjectIds) || !Array.isArray(removeProjectIds)) {
      return res.status(400).json({
        success: false,
        message: 'Both addProjectIds and removeProjectIds must be arrays'
      });
    }

    const projectsToAdd = await AddProject.find({
      project_id: { $in: addProjectIds }
    });

    const projectNamesToAdd = projectsToAdd.map((project) => project.projectName);

    if (addProjectIds.length > 0) {
      await AddUser.findOneAndUpdate(
        { user_id: userId },
        {
          $addToSet: {
            project_ids: { $each: addProjectIds },
            projectNames: { $each: projectNamesToAdd }
          }
        },
        { new: true }
      );
    }

    const user = await AddUser.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const namesToRemove = user.projectNames.filter((_, index) => removeProjectIds.includes(user.project_ids[index]));

    if (removeProjectIds.length > 0) {
      await AddUser.findOneAndUpdate(
        { user_id: userId },
        {
          $pullAll: { project_ids: removeProjectIds },
          $pull: { projectNames: { $in: namesToRemove } }
        },
        { new: true }
      );
    }

    const updatedUser = await AddUser.findOne({ user_id: userId }).select('-password');
    res.json({
      success: true,
      message: 'User projects updated successfully',
      user: updatedUser
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
