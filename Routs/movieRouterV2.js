const express=require('express')
const MovieConrollers=require('../Controllers/MovieControllerV3')
const authController=require('../Controllers/authController')


const router=express.Router()
// router.param('id',MovieConrollers.check)
router.route('/aggregate').get(MovieConrollers.dataAggregator)

router.route('/certified/:certifiedField').get(MovieConrollers.getpersonByfield)
router.route('/')
            .get(authController.protect,MovieConrollers.getAllMovies)
            .post(MovieConrollers.checkBody,MovieConrollers.postMovie)
router.route('/:id')
            .get(authController.protect,MovieConrollers.get_a_Movie)
            .patch(MovieConrollers.update_a_Movie)
            .delete(authController.protect,authController.restrict('admin'),MovieConrollers.deleteMovie)

module.exports=router