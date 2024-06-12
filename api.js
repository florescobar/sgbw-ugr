import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));

const fastify = Fastify({
  logger: true
})

fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/public',
  index: false, 
  list: false
})


fastify.get('/', async  (req, res) => {
  res.send({ hello: 'world' })
})

fastify.setErrorHandler((error, req, res) => {
  res.status(500).send({ ok: false, error })
})

import facturasRoute from './facturas.js'
fastify.register(facturasRoute, {prefix:'/api/facturas/'})

// Run the server!
try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}