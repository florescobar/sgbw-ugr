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

app.use(express.urlencoded({ extended: true }));
			
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

app.get('/create-facture', async (req, res) => {
  	res.render('home.html', {createfacture: true})
});

app.post('/save-factura', async (req, res) => {
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
        res.send('Factura guardada correctamente.');
		res.render('home.html', {createfacture: true})
    } catch (error) {
        console.error('Error al guardar la factura:', error);
        res.status(500).send('Error interno del servidor.');
    }
});

app.get('/facturas', async (req, res) => {
	const facturas = await prisma.factura.findMany()

	const facturasFormateadas = facturas.map(factura => ({
		...factura,
		date: formatearFecha(factura.date)
	}));

	// Renderizar la tabla de facturas
	//res.render('facturas', { facturas: facturasFormateadas });

	res.render('home.html', {facturas: facturasFormateadas})
});

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
	
