const express =require("express");
const router=express.Router();

const {createProject,updateProject,deleteProject,viewProject,displayProjects,likeProject,dislikeProject, getLike}=require("../controllers/Project")

//middleware
const {auth} = require("../middlewares/auth");

// Project Routes

router.get("/projects/",displayProjects);

router.get("/projects/:projectId",viewProject);

//use auth in these routes
router.post("/projects/create",auth,createProject);

router.put("/projects/:projectId",auth,updateProject);

router.delete("/projects/:projectId",auth,deleteProject);


router.get("/projects/:projectId/like", auth, getLike);

router.post("/projects/:projectId/like",auth,likeProject);
router.post("/projects/:projectId/dislike",auth,dislikeProject);

module.exports = router;