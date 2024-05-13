import Fastify from 'fastify'
const fastify = Fastify({
  logger: true
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