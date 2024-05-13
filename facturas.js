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

}
export default routes