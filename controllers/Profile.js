const User = require("../models/user");
const Profile = require("../models/Profile");
const cron = require('node-cron');
const moment = require('moment');
const {uploadImageToCloudinary} = require("../utils/imageUploader");
require("dotenv").config();
exports.updateProfile = async(req , res) => {
    try{
        const {dateOfBirth = "" , about="" , contactNumber , gender} = req.body;
        const id = req.user.id;
         if(!contactNumber || !gender){
            return res.status(400).json({
                success: false,
                message: "All fields are required",
              });
         }

         const userDetails = await User.findById({_id : id});
         const profileId = userDetails.additionDetail;
         console.log("profileId");
         console.log(profileId);
         const profileDetail = await Profile.findById(profileId);
         
         profileDetail.dateOfBirth = dateOfBirth;
         profileDetail.about = about;
         profileDetail.contactNumber = contactNumber;
         profileDetail.gender = gender;

         await profileDetail.save();
         
         return res.status(200).json({
            success: true,
            message: " Profile updated successfully",
            data : profileDetail
          });
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
          });
    }
}

exports.deleteAccount = async(req , res) => {
    try{
        const id = req.user.id;
        
        const userDetail = await User.findById(id);
        if(!userDetail){
            return res.status(404).json({
                success: false,
                message: "User not found"
              });
        }
        
        await Profile.findByIdAndDelete({_id : userDetail.additionDetail});

        await User.findByIdAndDelete({_id : id});
        return res.status(200).json({
            success: true,
                message: "User deleted Successfully"
            })
    }
    catch(err){
        return res.status(500).json({
            success: true,
                message: "Error in deletion"
            })
    }
}


// exports.deleteAccount = async (req, res) => {
//   try {
//     const id = req.user.id;

//     const userDetail = await User.findById(id);
//     if (!userDetail) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     // Calculate the date and time for deletion (5 days from now)
//     const deletionDate = moment().add(5, 'days').toDate();

//     // Wrap cron.scheduleJob in a Promise
//     const scheduleDeletion = () => {
//       return new Promise((resolve, reject) => {
//         const job = cron.scheduleJob(deletionDate, async () => {
//           try {
//             await Profile.findByIdAndDelete({ _id: userDetail.additionDetail });
//             await User.findByIdAndDelete({ _id: id });
//             console.log('User deleted successfully.');

//             // Cancel the job after execution to avoid running it again
//             job.cancel();
//             resolve();
//           } catch (error) {
//             console.error('Error in deletion:', error);
//             reject(error);
//           }
//         });
//       });
//     };

//     // Wait for the deletion to be scheduled before responding
//     await scheduleDeletion();

//     return res.status(200).json({
//       success: true,
//       message: "Deletion scheduled successfully",
//       deletionDate: deletionDate,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({
//       success: false,
//       message: "Error in scheduling deletion",
//     });
//   }
// };




exports.getUserDetail = async(req, res) => {
    try{
        const id = req.user.id;

        const userData = await User.findById(id).populate("additionDetail").exec();

        return res.status(200).json({
            success: true,
            message: "User Details fetched successfully",
            userData,
          });
        
    }catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
          });
    }
}

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    const userDetails = await User.findOne({
      _id: userId,
    })
      .populate("courses")
      .exec()
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      })
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
};

exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )
    console.log(image)
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    )
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
};
