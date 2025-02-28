import { CdpUploaderSyncClient } from '../../cdp-uploader/cdp-uploader-sync-client.js'

export const uploadRoutes = {
  name: 'upload-routes',
  register: async function (server) {
    server.route([
      {
        method: 'POST',
        path: '/upload/sync',
        handler: async (request, h) => {
          try {
            const client = new CdpUploaderSyncClient()
            // Extract file and pass remaining fields as form data
            const { file, ...formFields } = request.payload
            const result = await client.uploadSync(file, formFields)
            return h.response(result)
          } catch (error) {
            console.error('Upload failed:', error)
            return h.response({ error: error.message }).code(500)
          }
        },
        options: {
          payload: {
            output: 'stream',
            parse: true,
            multipart: true,
            maxBytes: 100 * 1024 * 1024 // 100MB limit
          }
        }
      }
    ])
  }
}
