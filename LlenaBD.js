// LlenaBD.js
// Llena la BD desde 
const url = 'https://dummyjson.com/users'

import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

LlenaBD(url)

async function LlenaBD(url) {      // función asíncrona para poder usar await
	const res   = await fetch(url)
	const datos = await res.json()   // json en la respuesta
	const users = datos.users
	// console.log(users)
	for(const user of users) {
		const {firstName, lastName, email, username, image} = {...user}   // ES6 Destructuring Assignment
		const usuario = {
			firstName,                  // como firstName: firstName
			lastName,
			email,
			username,
			image
		}
		// console.log(usuario)
		const createUser = await prisma.user.create({data:usuario})
		console.log(createUser)
	}
}