// app.js
import express from 'express'
import nunjucks from 'nunjucks'
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import winston from 'winston';
import auth from './auth.js'
import session from 'express-session'
import passport from 'passport'
// Usamos "local" strategy
import LocalStrategy from 'passport-local' 
import cookieParser from 'cookie-parser'


dotenv.config()

const prisma = new PrismaClient();
const IN   = process.env.IN            // 'development' or 'production'
const PORT = process.env.PORT
var app = express()
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use('/auth', auth)

nunjucks.configure('views', {         // directorio 'views' para los templates html
	autoescape: true,
	noCache:    IN == 'development',
	watch:      IN == 'development',
	express: app
})


app.use(cookieParser("secret"))

app.use(session({
	secret: "secret",
	resave: false ,
	saveUninitialized: true ,
}))

app.use(passport.initialize())
app.use(passport.session())    
   
passport.use(new LocalStrategy (authUser))

/*passport.use(new LocalStrategy (function (username, password, done) {
	logger.debug(`-----> Autentificando  a ${username}`)
	logger.debug(`----->    con password ${password}`)
	const userdb = await prisma.user.findUnique({
		where: {
			username: username,
			password: password
		}
	})

	if(username == "florescobar919" && password == "1234")
		return done(null, {id:1, name:"uriel"})
	return done(null, false)

	if (!userdb) {
		logger.debug(`El usuario ${username} no está en la Base de Datos`)
		return done(null, false)
	}

	const authenticated_user = { username: userdb.username, admin:userdb.admin}
	return done (null, authenticated_user)
}))*/

passport.serializeUser( (userObj, done) => {
	done(null, userObj)
})
passport.deserializeUser((userObj, done) => {
	done (null, userObj )
})

async function  authUser(username, password, done) {
	logger.debug(`-----> Autentificando  a ${username}`)
	logger.debug(`----->    con password ${password}`)
	const userdb = await prisma.user.findUnique({
		where: {
			username: username,
			password: password
		}
	})

	if (!userdb) {
		logger.debug(`El usuario ${username} no está en la Base de Datos`)
		return done(null, false)
	}

	const authenticated_user = { username: userdb.username, admin:userdb.admin}
	return done (null, authenticated_user)
}

const checkAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) { return next() }
	res.redirect("/auth/login")
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});
			
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

app.get('/create-facture', checkAuthenticated, async (req, res) => {
		const username = req.session.passport.user.username
  	res.render('home.html', {createfacture: true, username})
});

app.post('/save-factura', checkAuthenticated, async (req, res) => {
	try 
	{
		const { client, date, concept, cuantity, price } = req.body;
		const factura = await prisma.factura.create({
				data: {
						client,
						date: new Date(`${date}T00:00:00.000Z`), 
						concept,
						cuantity: parseFloat(cuantity),
						price: parseFloat(price),
						total: parseFloat(cuantity) * parseFloat(price) 
				}
    });
		logger.log('info', 'Factura guardada correctamente.');
		const facturas = await prisma.factura.findMany()
		const facturasFormateadas = facturas.map(factura => ({
			...factura,
			date: formatearFecha(factura.date)
		}));

		res.redirect('/facturas');
    } catch (error) {
			logger.error(`$Error al guardar la factura: {error}`);
      res.status(500).send('Error interno del servidor.');
    }
});

app.get('/facturas', checkAuthenticated,  async (req, res) => {
	const facturas = await prisma.factura.findMany()
	const username = req.session.passport.user.username
	const facturasFormateadas = facturas.map(factura => ({
		...factura,
		date: formatearFecha(factura.date)
	}));

	res.render('home.html', { facturas: facturasFormateadas, username });	
});

app.post('/login', passport.authenticate('local', {
	successRedirect: "/usuarios",
	failureRedirect: "/auth/login"
}));


app.use(function(req, res, next) {
	res.status(404).render("404.html")
})

app.listen(PORT, () => {
console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

function formatearFecha(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
	
