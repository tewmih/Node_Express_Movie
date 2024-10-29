const personalModel=require('../Models/MovieModel')
const ApiFeatures=require('../Utility/ApiFeatures')
const asyncErrorHandler=require('../Utility/asyncErrorHandler')
const customErrHandler=require('../Utility/CustomErrorHandler')
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
exports.dataAggregator = asyncErrorHandler(async (req, res) => {
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
 });
 
//  
exports.getpersonByfield=asyncErrorHandler(async (req,res)=>{
        let certified=req.params.certifiedField

        const filtered=await personalModel.find([
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
})

exports.getAllMovies=asyncErrorHandler(async (req,res)=>{
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
})

exports.get_a_Movie=asyncErrorHandler(async (req,res)=>{
        const person=await personalModel.findById(req.params.id)
        // 404 not found error
        if(!person){
            const err=new customErrHandler("Id doesn't exist")
            return next(err)
        }
        res.status(200).json({
            status:'success',
            data:{
                person
            }
        })
})

exports.update_a_Movie= asyncErrorHandler(async (req,res)=>{
        const person=await personalModel.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidator:true})
        res.status(200).json({
            status:'success',
            data:{
                person
            }
        })
})

exports.postMovie=asyncErrorHandler(async(req,res)=>{
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
             const personalDoc=await personalModel.create(req.body)
             res.status(201).json({
                status:'success',
                data:{
                    personalDoc
                }
             })
    })

exports.deleteMovie=asyncErrorHandler(async (req,res)=>{
        const person=await personalModel.findByIdAndDelete(req.params.id)
        res.status(200).json({
            status:'success',
            data:{
                person
            }
        })
    })