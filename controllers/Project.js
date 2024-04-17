const User = require("../models/studentModel");
const Project = require("../models/projectModel");
const { uploadImageToCloudinary, uploadFileToCloudinary } = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;
const Like = require("../models/likeModel");
const Student = require("../models/studentModel");

//get all projects
exports.displayProjects = async (req, res) => {
  try {
    const allProjects = await Project.find({})
    // .populate("")
    // .exec()

    return res.status(200).json({
      success: true,
      data: allProjects,
    })
  } catch (error) {
    console.log(error)
    return res.status(404).json({
      success: false,
      message: `Unable to fetch the projects Data`,
      error: error.message,
    })
  }
};

//get all projects
exports.viewProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log(projectId)
    const project = await Project.findById(projectId);

    return res.status(200).json({
      success: true,
      data: project,
    })
  } catch (error) {
    console.log(error)
    return res.status(404).json({
      success: false,
      message: error.message,
    })
  }
};

//create new project
exports.createProject = async (req, res) => {
  try {
    console.log(req.user);
    const userid = req.user._id;

    let { title, description, tags, } = req.body;
    console.log("Tags: ", tags)
    tags = tags.split(",").map(tag => tag.trim().replace(/"/g, '')).map(tag => tag.replace(/\[,|\]/g, ''));
    console.log("Tags: ", tags)
    console.log("REquest User:", req.user, "\n Title: ", title, "\n description: ", description)


    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required fields"
      });
    }


    console.log("-----------------REQUEST FROM USER---------");
    console.log(req.files);



    const projectDocs = req.files.projectFiles;

    //upload the project zip to cloudinary
    const projectFiles = await uploadImageToCloudinary(
      projectDocs,
      process.env.FOLDER_NAME
    )
    console.log(projectFiles)

    let filesUploaded = [projectFiles.secure_url];
    console.log(filesUploaded);
    console.log("*********************************************")
    console.log(userid)

    // Create project
    const project = await Project.create({
      title,
      description,
      // category,
      tags: tags || [],
      // collaborators: collaborators || [],
      files: filesUploaded || [],
      createdBy: userid // Assuming you're using JWT authentication and have access to req.user._id
    });

    // Update student's projects array
    await User.findByIdAndUpdate(
      userid,
      { $push: { projects: project._id } }, // Add project ID to projects array
      { new: true }
    );

    return res.status(201).json({
      success: true,
      project,
      message: "Project created successfully"
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message

    });
  }
};

//controller to update any field in project
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    let { title, description, tags, url } = req.body;
    console.log(url)
    console.log(tags)
    tags = tags.split(",").map(tag => tag.trim().replace(/"/g, '')).map(tag => tag.replace(/\[,|\]/g, ''));
    console.log(tags)
    let filesUploaded = [];

    console.log("REq> body from react app", req.body)
    console.log("REq> files from react app", req.files)

    // Check if new project files are provided in the request
    console.log("Length of files: ", req.files?.projectFiles?.length);
    if (req.files && req.files?.projectFiles && req.files?.projectFiles?.length > 0) {
      const projectFiles = req.files.projectFiles;

      // Upload each file to Cloudinary
      for (let i = 0; i < projectFiles.length; i++) {
        const file = projectFiles[i];
        const uploadedFile = await uploadImageToCloudinary(file, process.env.FOLDER_NAME);
        console.log(file, " Uploaded files to cloudinary AS:", uploadedFile)
        filesUploaded.push(uploadedFile.secure_url);
      }
    }

    // Find the project by its ID
    let project = await Project.findById(projectId);

    // Check if the project exists
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Check if the user making the request is the owner of the project
    if (String(project.createdBy) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this project"
      });
    }

    // Update the specified fields of the project
    project.title = title;
    project.description = description;
    project.tags = tags;
    project.url = url;

    // Update project files if new files are provided
    if (filesUploaded.length > 0) {
      project.files = filesUploaded;
    }

    // Save the updated project
    const updatedProject = await project.save();

    // Return success response with the updated project
    return res.status(200).json({
      success: true,
      project: updatedProject,
      message: "Project updated successfully"
    });
  } catch (err) {
    console.error("Error updating project:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


//to view all the details of the project
exports.viewProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Find the project by its ID
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Return success response with the project details
    return res.status(200).json({
      success: true,
      project,
      message: "Project details retrieved successfully"
    });
  } catch (err) {
    console.error("Error viewing project:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id; // Assuming you have the user ID stored in req.user from authentication middleware

    // Find the project by its ID
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    //WILL DO LATER

    // // Check if the logged-in user is the owner of the project
    // if (project.createdBy.toString() !== userId) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "You are not authorized to delete this project"
    //   });
    // }

    // Delete the project
    const deletedProject = await Project.findByIdAndDelete(projectId);

    if (!deletedProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    await User.findByIdAndUpdate(
      userId,
      { $pull: { projects: projectId } }, // Add project ID to projects array
      { new: true }
    );
    // Return success response
    return res.status(200).json({
      success: true,
      message: "Project deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting project:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


exports.getLike = async (req, res) => {
  try {

    const { projectId } = req.params;
    const userId = req.user._id;

    console.log(userId)

    const getLike = await Like.findOne({ project: projectId, student: userId });
    console.log("Get Like", getLike)
    const totalLikes = await Like.countDocuments();
    if (getLike) {
      return res.status(200).json({
        success: true,
        data: true,
        totalLikes,
        message: "You have liked this project"
      });
    }

    if (getLike === null) {
      return res.status(200).json({
        success: true,
        data: false,
        totalLikes,
        message: "You have not liked this project"
      });

    }

  } catch (err) {
    console.log(err.message);
    return res.status(400).json({
      success: false,
      message: "Error while fetching like data"
    });
  }
}



// Controller function to like a project
exports.likeProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id; // Assuming you have the user ID stored in req.user from authentication middleware

    // Check if the user has already liked the project
    const existingLike = await Like.findOne({ project: projectId, student: userId });

    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: "You have already liked this project"
      });
    }

    // Create a new like for the project
    const newLike = Like({
      project: projectId,
      student: userId
    });
    await newLike.save();

    console.log(projectId)
    // Update the student's likedProjects field
    const newProject = await Project.findById(projectId)
    await Project.findByIdAndUpdate(
      projectId,
      { $push: { likes: newLike._id } },
      { new: true }
    );
    const newStudent = await Student.findById(projectId)
    await Student.findByIdAndUpdate(
      userId,
      { $push: { likes: newLike._id } },
      { new: true }
    );
    // console.log(newProject)

    return res.status(201).json({
      success: true,
      like: newLike,
      message: "Project liked successfully"
    });
  } catch (err) {
    console.error("Error liking project:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Controller function to dislike a project
exports.dislikeProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    // Find and delete the like for the project by the current user
    const deletedLike = await Like.findOneAndDelete({ project: projectId, student: userId });

    if (!deletedLike) {
      return res.status(404).json({
        success: false,
        message: "You have not liked this project"
      });
    }

    // Update the student's likedProjects field
    await Project.findByIdAndUpdate(
      projectId,
      { $pull: { likes: deletedLike._id } },
      { new: true }
    );
    await Student.findByIdAndUpdate(
      userId,
      { $pull: { likes: deletedLike._id } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      data: deletedLike,
      message: "Project disliked successfully"
    });
  } catch (err) {
    console.error("Error disliking project:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};