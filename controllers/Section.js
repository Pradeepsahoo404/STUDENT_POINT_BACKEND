const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async(req , res) => {
    try{
        const {sectionName , courseId} = req.body;
        if(!sectionName || !courseId){
            return res.status(400).json({
                success : false,
                massage: "Please fill all fields"
            });
        }
        const sectionData = await  Section.create({sectionName});

        const updateCourse = await Course.findByIdAndUpdate(
            { _id: courseId },
            { $push: { courseContent: sectionData._id } },
            { new: true }
        ).populate({
            path: 'courseContent',
            populate: {
                path: 'subSection',
                model: 'SubSection'
            }
        });
        
        console.log(updateCourse);
        
        return res.status(200).json({
            success : true,
            message : "Section created successfully",
            data : updateCourse,
            });

        }
    
    catch(err){
        return res.status(500).json({
            success : false,
            message : "Unable to create section please try again",
            message : err.message
            });
    }
}

exports.updateSection = async(req , res) => {
    try{
    
        const {sectionName , sectionId} = req.body;
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success : false,
                massage: "Please fill all fields"
            });
        }

        const sectionUpdate = await Section.findByIdAndUpdate(sectionId , {sectionName} , {new : true})

        return res.status(200).json({
            success : true,
            message : "Section Updated successfully",
            data : sectionUpdate,
            });

    }catch(err){
        return res.status(500).json({
            success : false,
            message : "Unable to Update section please try again",
            message : err.message
            });
    }
}

exports.deleteSection = async(req , res) => {
    try{
        const sectionId = req.params.id;

        await Section.findByIdAndDelete(sectionId);

        return res.status(200).json({
            success : true, 
            message : "Deleted Successfully"  
        });   
    }
    catch(err){
        return res.status(500).json({
            success : false,
            message : "Unable to Delete section please try again",
            message : err.message
            });
    }
}