const fs=require('fs')
const path = require('path');

const Movies=JSON.parse(fs.readFileSync(path.join(__dirname,'../Data/Movies.json'),'utf-8'))

exports.check=(req,res,next,value) =>{
    console.log(value)
    let movieFounded=Movies.find((element)=>element.id==value)

    if(!movieFounded){
        return res.status(404).json({
            status:'fail',
            data:{
                message:'no such id found'
            }
        })
    }
next();

}

exports.checkBody=(req,res,next)=>{
    if(!req.body.name && !req.body.year){
        return res.status(400).json({
            status:'fail',
            data:{
                message:"body doesn't exist"
            }
        })
    }
    next()

}
exports.getAllMovies=(req,res)=>{
    res.status(200).json({
        status:'success',
        count:Movies.length,
        data:{
           Movies
        }
    })
}

exports.get_a_Movie=(req,res)=>{
    //    1
// Movies.map((element)=>{
//     if(Number(element.id)==Number(req.params.id)){
//         res.send(element)
//         return
//     }
// })
// res.send('no such id')
//   2
let newId=req.params.id*1
let movieFounded=Movies.find((element)=>element.id==newId)

// if(!movieFounded){
//     return res.status(404).json({
//         status:'fail',
//         data:{
//             message:'no such id found'
//         }
//         })
// }

res.status(200).json({
    status:'success',
    data:{
        movieFounded
    }
    })
}

exports.update_a_Movie=(req,res)=>{
    let id=req.params.id*1;
    let movieToaBeUpdated=Movies.find((element)=>element.id*1==id)
    // if(!movieToaBeUpdated){
    //    return res.status(404).json({
    //         status:"fail",
    //         message:'No such id found'
    //     })
    // }
    const index=Movies.indexOf(movieToaBeUpdated)
            //  1  
    // let updatedMovie={
    //     id:movieToaBeUpdated.id,
    //     name:req.body.name?req.body.name:movieToaBeUpdated.name,
    //     year:req.body.year?req.body.year:movieToaBeUpdated.year
    // }
    // Movies[index]=updatedMovie
            // 2

    Object.assign(movieToaBeUpdated,req.body)
    Movies[index]=movieToaBeUpdated
    fs.writeFile('../Data/Movies.json',JSON.stringify(Movies),(error)=>{
    if(!error){
        
        res.status(200).json({
            status:'success',
            data:{
                movieToaBeUpdated
            }
        })
    }else{
        res.status(500).json({
            status:"fail",
            data:{
                message:'some internal error'
            }})
    }
    })}

    exports.postMovie=(req,res)=>{
        const newId=Movies[Movies.length-1].id+1
        const newMovie=Object.assign({"id":newId},req.body)
        Movies.push(newMovie)
        res.send(newMovie)
    }

    exports.deleteMovie=(req,res)=>{
        const id=req.params.id*1;
        let movietobedeleted=Movies.find((element)=>element.id*1==id);
        // if(!movietobedeleted){
        //     return res.status(404).json({
        //         status:'fail',
        //         data:{
        //             message:'Id not found!'
        //         }
        //     })
        // }
        const index=Movies.indexOf(movietobedeleted)
        Movies.splice(index,1)
        fs.writeFile('../Data/Movies.js',JSON.stringify(Movies),(error)=>{
            console.log(Movies)
            if(error){
                return res.status(404).json({
                    status:'fail',
                    data:{
                        message:'internal error to delete the file'
                    }
                })
            }else{
                res.status(200).json({
                    movietobedeleted
                })
            }})
    }