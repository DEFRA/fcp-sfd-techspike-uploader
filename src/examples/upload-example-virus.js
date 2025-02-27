import { CdpUploaderClient } from '../services/cdp-uploader-client.js'

async function uploadExample () {
  try {
    // Create an instance of the uploader client with necessary configuration.
    const client = new CdpUploaderClient({
      baseUrl: 'http://localhost:7337',
      s3Bucket: 'my-bucket'
    })

    // Step 1: Initiate the upload process.
    console.log('Starting upload')
    const init = await client.initiate({ customerId: '12345', requestId: 'example-virus' })
    console.log('Initiated:', init)

    // Step 2: Upload the file using the URL from the initiation step.
    // The filename contains 'virus' to trigger the mock virus scanner
    await client.uploadFile(
      init.uploadUrl,
      Buffer.from('Test file content'),
      'test-virus-file.txt'
    )
    console.log('File uploaded')

    // Step 3: Wait for the server to process the file.
    const status = await client.waitForCompletion(init.statusUrl)
    console.log('Completed:', status)

    // Step 4: Check for any rejected files and log file details.
    if (status.numberOfRejectedFiles) {
      console.error('File was rejected due to virus:', status.form)
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
