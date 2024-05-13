import express from 'express'
const  router = express.Router()	
			
// para /auth/login
router.get('/login', (req, res) =>{
	res.render('login.html')
})

export default router