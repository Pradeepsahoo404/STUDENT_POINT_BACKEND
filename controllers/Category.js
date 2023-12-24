const Category = require("../models/Category");


exports.createCategory = async (req , res) => {
try{

    const {name , description } = req.body;
    const adminId = req.user.id;
    if(!name || !description){
        return res.status(400).json({
            success: false,
            error:"Please provide all fields"
        })
    };

const categoryDetails = await Category.create({
    name , 
    description,
    adminId
});
    return res.status(200).json({
        success : true,
        message : "Category created successfully",
        data : categoryDetails
    })
    
    
}catch(error){
    console.error("Error:", error);
    return res.status(500).json({
     success : false,
     message : "Category not createdn successfully"   
    })

}
}

exports.showAllCategories = async (req, res) => {
    try {
        const categorys = await Category.find({} , {name : true , description : true});

        if (!categorys || categorys.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No Category found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "All Category are retrive successfully",
            data: categorys
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

exports.categoryPageDetail = async (req ,res) => {
    try{
        const categoryId = req.body.categoryId;
        const selectedCatagory = await Category.findById(categoryId).populate("course").exec();
        if(!selectedCatagory){
            return res.status(404).json({
                success: false,
                message: "No Data found"
            }); 
        }

        const categoryDiffernt = await Category.find({_id : {$ne : categoryId}}).populate("course").exec();


        return res.status(200).json({
            success: true,
            message: "All Category are retrive successfully",
            data: {
                selectedCatagory, 
                categoryDiffernt
            }})
       

    }catch(err){
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}