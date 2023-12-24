const Section = require("../models/Section");
const Subsection = require("../models/SubSection");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
require("dotenv").config();

exports.createSubSection = async (req, res) => {
  try {
    const { sectionId, title, timeDuration, description } = req.body;
    const  video  = req.files.videoFile;

    if (!sectionId || !title || !timeDuration || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const videoUrl = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

    const subSectionDetails = await Subsection.create({
      title: title,
      description: description,
      timeDuration: timeDuration,
      videoUrl: videoUrl.secure_url,
    });

    const sectionDataUpdate = await Section.findByIdAndUpdate(
      sectionId,
      { $push: { subSection: subSectionDetails._id } },
      { new: true }
    ).populate("subSection");

    return res.status(200).json({
      success: true,
      message: "Sub-Section Updated successfully",
      data: sectionDataUpdate,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unable to Update Sub-Section please try again",
      message: err.message,
    });
  }
};

exports.updateSubSection = async (req, res) => {
  try {
    const { subSectionId } = req.params.id;
    const body = req.body;
    const video = req.files.videoFile;

    if (!video) {
      return res.status(400).json({
        success: false,
        message: "Please provide a video file",
      });
    }

    const videoUrl = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

    const existingSubsection = await Subsection.findById(subSectionId);

    if (!existingSubsection) {
      return res.status(404).json({
        success: false,
        message: "Subsection not found",
      });
    }

    const updateSubsection = await Subsection.findByIdAndUpdate(
      subSectionId,
      {
        ...body,
        videoUrl: videoUrl,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Updated Successfully",
      data: updateSubsection,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Error in updating the subsection",
    });
  }
};
exports.deleteSubSection = async (req, res) => {
  try {
    const { id } = req.params;
    const subSectionData = await Subsection.findById(id);

    if (!subSectionData) {
      return res.status(404).json({
        success: false,
        message: "Subsection not found",
      });
    }

    await Subsection.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Deleted Successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Error in deleting the subsection",
    });
  }
};
