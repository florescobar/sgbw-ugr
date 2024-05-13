import { PrismaClient, Prisma } from '@prisma/client'
export const prisma = new PrismaClient()

async function routes (fastify, options) {
	// ruta /api/facturas/:id
  fastify.get(':id', async (req, res) => {
		const { id } = req.params  
		// todas las facturas, ruta /api/facturas/
		let consulta = {}    
    // si existe id, p.e. /api/facturas/2
    if (id) {
      consulta = {
        where: {
          id: Number(id)
        }
      }
    }

    try { 
	    const facturas = await prisma.factura.findMany(consulta)
      // no encontrada factura
      if (!facturas.length) {
        res.code(500)
        res.send({ok: false, error: `Invalid id ${id}`})
      }      
      res.send({ok: true, data: facturas})
    }

    catch (error) {
      fastify.log.error(error)
      throw new Error(error)
    }
  })

  // Falta
  // post, put, delete

	// POST /api/facturas - Crear una nueva factura
  fastify.post('/', async (req, res) => {
    try {
      const factura = await prisma.factura.create({
        data: req.body
      })

      res.send({ ok: true, data: factura })
    } catch (error) {
      fastify.log.error(error)
      res.code(500)
      res.send({ ok: false, error: 'Internal server error' })
    }
  })

  // PUT /api/facturas/:id - Actualizar una factura existente
  fastify.put('/:id', async (req, res) => {
    const { id } = req.params

    try {
      const factura = await prisma.factura.update({
        where: {
          id: Number(id)
        },
        data: req.body
      })

      res.send({ ok: true, data: factura })
    } catch (error) {
      fastify.log.error(error)
      res.code(500)
      res.send({ ok: false, error: 'Internal server error' })
    }
  })

  // DELETE /api/facturas/:id Eliminar una factura existente
  fastify.delete('/:id', async (req, res) => {
    const { id } = req.params

    try {
      await prisma.factura.delete({
        where: {
          id: Number(id)
        }
      })

      res.send({ ok: true, message: `Factura con Id ${id} eliminado correctamente` })
    } catch (error) {
      fastify.log.error(error)
      res.code(500)
      res.send({ ok: false, error: 'Internal server error' })
    }
  })

}
export default routes