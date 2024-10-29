const express=require('express')
const fs=require('fs')

const app=express()
app.use(express.json())

const Movies=JSON.parse(fs.readFileSync('../Data/Movies.json','utf-8'))

// /api/v1/movies
app.get('/api/v1/movies',(req,res)=>{
    res.status(200).json({
        status:'success',
        count:Movies.length,
        data:{
           Movies
        }
    })
})

// /api/v1/movies/:id/...
app.get('/api/v1/movies/:id',(req,res)=>{
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
    
    if(movieFounded){
        res.status(200).json({
            status:'success',
            data:{
                movieFounded
            }
        })
    }else{
        res.status(404).json({
            status:'fail',
            data:{
                message:'no such id found'
            }
        })
    }

})

// patch
app.patch('/api/v1/movies/:id',(req,res)=>{
    let id=req.params.id*1;
    let movieToaBeUpdated=Movies.find((element)=>element.id*1==id)
    if(!movieToaBeUpdated){
       return res.status(404).json({
            status:"fail",
            message:'No such id found'
        })
    }
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
            }
        })
    }
    })
   
})

app.post('/api/v1/movies',(req,res)=>{
    const newId=Movies[Movies.length-1].id+1
    const newMovie=Object.assign({"id":newId},req.body)

    Movies.push(newMovie)

    
    res.send(newMovie)
})

// dlelete api
app.delete('/api/v1/movies/:id',(req,res)=>{
    const id=req.params.id*1;
    let movietobedeleted=Movies.find((element)=>element.id*1==id);
    if(!movietobedeleted){
        return res.status(404).json({
            status:'fail',
            data:{
                message:'Id not found!'
            }
        })
    }
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
        }
    })

})


app.listen(6003,'localhost',()=>{
    console.log('server is running...')
})