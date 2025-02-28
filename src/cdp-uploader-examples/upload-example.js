import { CdpUploaderClient } from '../cdp-uploader/cdp-uploader-client.js'

async function uploadExample () {
  try {
    // Create an instance of the uploader client with necessary configuration.
    const client = new CdpUploaderClient({
      baseUrl: 'http://localhost:7337',
      s3Bucket: 'my-bucket'
    })

    // Step 1: Initiate the upload process.
    console.log('Starting upload')
    const init = await client.initiate({ customerId: '12345', requestId: 'example-1' })
    console.log('Initiated:', init)

    // Step 2: Upload the file using the URL from the initiation step.
    await client.uploadFile(
      init.uploadUrl,
      Buffer.from('Test file content'), // Convert test content to a buffer.
      'test-file.txt'
    )
    console.log('File uploaded')

    // Step 3: Wait for the server to process the file.
    const status = await client.waitForCompletion(init.statusUrl)
    console.log('Completed:', status)

    // Step 4: Check for any rejected files and log file details.
    if (status.numberOfRejectedFiles) {
      console.error('Rejected files:', status.form)
    } else {
      const file = Object.values(status.form)[0]
      console.log('File location:', file.s3Bucket, file.s3Key)
    }
  } catch (err) {
    // Log any errors encountered during the upload process.
    console.error('Upload failed:', err.message)
  }
}

// Execute the upload example.
uploadExample()
