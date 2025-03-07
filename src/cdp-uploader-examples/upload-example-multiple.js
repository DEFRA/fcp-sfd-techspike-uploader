import { CdpUploaderClient } from '../cdp-uploader/cdp-uploader-client.js'

async function uploadExample () {
  try {
    // Create an instance of the uploader client
    const client = new CdpUploaderClient({
      baseUrl: 'http://cdp-uploader:7337', // Use Docker service name
      s3Bucket: 'my-bucket',
      redirectUrl: 'http://development:3001/health' // Use Docker service name
    })

    // Step 1: Initiate the upload process
    console.log('Starting upload')
    const init = await client.initiate({ customerId: '12345', requestId: 'example-multiple' })
    console.log('Initiated:', init)

    // Step 2: Upload multiple files using the same upload URL
    const files = [
      { content: 'First file content', name: 'file1.txt', field: 'file1' },
      { content: 'Second file content', name: 'file2.txt', field: 'file2' },
      { content: 'Third file content', name: 'file3.txt', field: 'file3' }
    ]

    // Upload all files in a single request
    await client.uploadFiles(init.uploadUrl, files)
    console.log('All files uploaded')

    // Step 3: Wait for all files to be processed
    const status = await client.waitForCompletion(init.statusUrl)
    console.log('Completed:', status)

    // Step 4: Check results for all files
    if (status.numberOfRejectedFiles) {
      console.error('Some files were rejected:', status.form)
    } else {
      console.log('All files uploaded successfully:')
      Object.entries(status.form).forEach(([fieldName, file]) => {
        console.log(`- ${file.filename}: ${file.s3Bucket}/${file.s3Key}`)
      })
    }
  } catch (err) {
    console.error('Upload failed:', err.message)
  }
}

// Execute the upload example
uploadExample()
