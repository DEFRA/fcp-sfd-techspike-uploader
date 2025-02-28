import { CdpUploaderSyncClient } from '../cdp-uploader/cdp-uploader-sync-client.js'

async function uploadExample () {
  try {
    // Create an instance of the sync client with Docker service configuration
    const client = new CdpUploaderSyncClient({
      baseUrl: 'http://cdp-uploader:7337',
      s3Bucket: 'my-bucket',
      redirectUrl: 'http://development:3001/health'
    })

    console.log('Starting synchronous upload...')

    // Single file example
    const singleResult = await client.uploadSync(
      Buffer.from('Test file content'),
      { customerId: '12345', requestId: 'sync-example-single' }
    )
    console.log('Single file upload complete:', singleResult)

    // Multiple files example
    const multipleResult = await client.uploadSync(
      [
        Buffer.from('First file content'),
        Buffer.from('Second file content')
      ],
      { customerId: '12345', requestId: 'sync-example-multiple' }
    )
    console.log('Multiple files upload complete:', multipleResult)
  } catch (err) {
    console.error('Upload failed:', err.message)
  }
}

// Run the example
uploadExample()
