// app.js
import express from 'express'
import nunjucks from 'nunjucks'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

import * as dotenv from 'dotenv'
dotenv.config()

const IN   = process.env.IN            // 'development' or 'production'
const PORT = process.env.PORT

var app = express()

nunjucks.configure('views', {         // directorio 'views' para los templates html
	autoescape: true,
	noCache:    IN == 'development',
	watch:      IN == 'development',
	express: app
})

app.use(express.static('public'));
			
app.set('view engine', 'html')

app.get('/',  (req, res) => {

	res.send('¡Hola, mundo!');
});

app.get('/usuarios', async (req, res) => {
	const allUsers = await prisma.user.findMany()
	res.render('home.html', {users: allUsers})
});

app.get('/usuarios/admin', async (req, res) => {
	const allAdminUsers = await prisma.user.findMany(		{
			where: {
			  admin: true,
			},
		}
	)
	res.render('home.html', {admins: allAdminUsers})
});

app.get('/usuarios/con-email/de/:dominio', async (req, res) => {
	var {dominio} = {... req.params}
	const allAdminUsersDomain = await prisma.user.findMany(
		{
			where: {
			  email: {
				contains: dominio
			  }
			},
		}
	)
  	res.render('home.html', {userswheredomain: allAdminUsersDomain, domain: dominio})
});

app.use(function(req, res, next) {
	res.status(404).render("404.html")
})

app.listen(PORT, () => {
console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
	
