const personalModel=require('../../Models/MovieModel')
const ApiFeatures=require('../../Utility/ApiFeatures')
// console.log(ApiFeatures)

exports.checkBody=(req,res,next)=>{
    if(!req.body.name && !req.body.age && !req.body.sex){
        return res.status(400).json({
            status:'fail',
            data:{
                message:"body doesn't exist"
            }
        })
    }
    next()

}

// aggregation
exports.dataAggregator = async (req, res) => {
    try {
        const stats = await personalModel.aggregate([
            { $match: { age: { $gte:34 } } },
            { 
                $group: {
                    _id: null,  // Groups all documents
                    averageAge: { $avg: '$age' },  
                    minAge: { $min: '$age' },
                    maxAge: { $max: '$age' },
                    ageSum: { $sum: '$age' },  
                }
            },
            {$sort:{age:1}},
            {$match:{price:{$gte:200}}}  // but since there is no price field.it works on the above formatted document
        ]);
 
        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        });
    } catch (error) {
        return res.status(400).json({
            status: 'fail',
            data: {
                message: error
            }
        });
    }
 };
 
//  
exports.getpersonByfield=async (req,res)=>{
    try{
        let certified=req.params.certifiedField

        const filtered=await personalModel.f([
           {$unwind:"$certificate"},
           {$group:{
               _id:'$certificate',
               avgSalary:{$avg:'$salary'},
               totalSalary:{$sum:'$salary'},
               persons:{$push:"$name"},
               totalCount:{$sum:1}
   
           }},
           {$addFields:{certified:'$_id'}},
        //    {$sort:{_id:1}}
           {$sort:{totalCount:1}},
           {$project:{_id:0}},
        //    {$unwind:'$persons'},
        //    {$sort:{avgSalary:1}},
        //    {$match:{avgSalary:{$gte:57000}}}
        {$match:{certified:certified}}

        ])
        res.status(200).json({
            status:'success',
            data:{
                filtered
            }
        })
    }catch(error){
        return res.status(404).json({
            status: 'fail',
            data: {
             error
            }
        });  
    }

}

exports.getAllMovies=async (req,res)=>{
    try{
        const feature=new ApiFeatures(personalModel.find(),req.query)
                                                    .sort()
                                                    .limitFields()
                                                    .pagination()
                                                    .filter()
                                                    
        let allPersons=await feature.query
        
        // console.log(allPersons)
        
        // const allPersons=await personalModel.find()


        res.status(200).json({
            status:'success',
            count:allPersons.length,
            data:{
                allPersons
            }
        })

    }catch(error){
          res.status(404).json({
            status:'failed',
            data:{
                message:error.message
            }
          })
    }

}

exports.get_a_Movie=async (req,res)=>{
    try{
        const person=await personalModel.findById(req.params.id)
        res.status(200).json({
            status:'success',
            data:{
                person
            }
        })
    }catch(error){
        res.status(404).json({
            status:'fail',
            data:{
                message:error.message
            }
        })
    }

}

exports.update_a_Movie= async (req,res)=>{
    try{
        const person=await personalModel.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidator:true})
        res.status(200).json({
            status:'success',
            data:{
                person
            }
        })
        
    }catch(error){
        res.status(404).json({
            status:'fail',
            data:{
                message:error.message
            }
        })
    }
}

exports.postMovie=async(req,res)=>{
                    //       method one
        // const movieDoc=new personalModel({
        //     req.body
        // })
        // movieDoc.save()
        //         .then(doc=>res.send(doc))
        //         .catch(error=>console.log(error))

                // method two
        // personalModel.create({
        //     req.body
        // }).then().catch()

            //   method three
         try{
             const personalDoc=await personalModel.create(req.body)
             res.status(201).json({
                status:'success',
                data:{
                    personalDoc
                }
             })

         }catch(error){
            res.status(400).json({
                status:'fail',
                data:{
                    message:error.message
                }
            })
         }

    }

exports.deleteMovie=async (req,res)=>{
    try{
        const person=await personalModel.findByIdAndDelete(req.params.id)
        res.status(200).json({
            status:'success',
            data:{
                person
            }
        })

    }catch(error){
        res.status(400).json({
            status:'fail',
            data:{
                message:error.message
            }
        })
    }


    }