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

    // Single file example with metadata
    const singleResult = await client.uploadSync(
      Buffer.from('Test file content'),
      {
        customerId: '12345',
        requestId: 'sync-example-single',
        fileName: 'test.txt',
        fileType: 'text/plain',
        uploadedAt: new Date().toISOString(),
        source: 'sync-example',
        environment: 'development'
      }
    )
    console.log('Single file upload complete:', singleResult)

    // Multiple files example with metadata
    const multipleResult = await client.uploadSync(
      [
        Buffer.from('First file content'),
        Buffer.from('Second file content')
      ],
      {
        customerId: '12345',
        requestId: 'sync-example-multiple',
        fileCount: 2,
        fileTypes: ['text/plain', 'text/plain'],
        fileNames: ['first.txt', 'second.txt'],
        uploadedAt: new Date().toISOString(),
        source: 'sync-example',
        environment: 'development',
        batchId: 'batch-' + Date.now()
      }
    )
    console.log('Multiple files upload complete:', multipleResult)
  } catch (err) {
    console.error('Upload failed:', err.message)
  }
}

// Run the example
uploadExample()
