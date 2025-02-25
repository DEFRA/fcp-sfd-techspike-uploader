<<<<<<< HEAD
import { healthController } from '~/src/api/health/controller.js'

/**
 * @satisfies {ServerRegisterPluginObject<void>}
 */
=======
import { healthHandler } from './handler.js'

>>>>>>> upstream/main
const health = {
  plugin: {
    name: 'health',
    register: (server) => {
      server.route({
        method: 'GET',
        path: '/health',
<<<<<<< HEAD
        ...healthController
=======
        ...healthHandler
>>>>>>> upstream/main
      })
    }
  }
}

export { health }
<<<<<<< HEAD

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
=======
>>>>>>> upstream/main
