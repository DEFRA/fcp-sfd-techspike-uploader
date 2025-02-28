// cdp-uploader-client.js
// A simple client for uploading files to our CDP service.
// The upload happens in 3 steps:
// 1. Initiate - Get upload & status URLs
// 2. Upload - Send the file data
// 3. Wait - Poll until processing completes

import FormData from 'form-data' // multipart formdata
import fetch from 'node-fetch'

export class CdpUploaderClient {
  constructor (config = {}) {
    this.baseUrl = new URL(config.baseUrl || 'http://cdp-uploader:7337')
    this.s3Bucket = config.s3Bucket || 'fcp-sfd-uploads'
    this.redirectUrl = config.redirectUrl || 'http://development:3001/health'
  }

  // Set up client with config or use defaults
  // Step 1: Start upload process & get URLs
  async initiate (metadata = {}) {
    // Send request to start a new upload
    const response = await fetch(new URL('initiate', this.baseUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        redirect: this.redirectUrl, // Where to redirect after upload
        s3Bucket: this.s3Bucket, // Target bucket
        metadata // Any extra info to store
      })
    })

    // Get response and resolve URLs relative to base URL
    const result = await response.json()
    const { pathname: uploadPath } = new URL(result.uploadUrl)
    const { pathname: statusPath } = new URL(result.statusUrl)

    return {
      ...result,
      uploadUrl: new URL(uploadPath, this.baseUrl).toString(),
      statusUrl: new URL(statusPath, this.baseUrl).toString()
    }
  }

  // Step 2: Upload the actual file
  async uploadFile (uploadUrl, fileData, filename) {
    // Create a form with our file
    const form = new FormData()

    // Convert string to buffer if needed - wont be needed for the object processor
    const buffer = Buffer.isBuffer(fileData) ? fileData : Buffer.from(fileData)

    // Add file to form
    form.append('file', buffer, filename)

    // Send the file to upload URL
    await fetch(uploadUrl, {
      method: 'POST',
      headers: form.getHeaders(),
      body: form
    })

    return true
  }

  // Helper: Check current status of file
  async checkStatus (statusUrl) {
    const response = await fetch(statusUrl)
    return await response.json()
  }

  // Step 3: Wait for file processing to complete
  async waitForCompletion (statusUrl, maxAttempts = 30, interval = 1000) {
    let attempts = 0

    // Keep checking status until we get a result
    while (attempts < maxAttempts) {
      const status = await this.checkStatus(statusUrl)

      // Success! File is processed
      if (status.uploadStatus === 'ready') {
        return status
      }

      // File was rejected
      if (status.uploadStatus === 'rejected') {
        throw new Error('Upload was rejected')
      }

      // Wait before checking again (1 second by default)
      await new Promise(resolve => setTimeout(resolve, interval))
      attempts++
    }

    // We checked too many times without success
    throw new Error('Upload timed out')
  }
}
