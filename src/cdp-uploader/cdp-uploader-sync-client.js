// cdp-uploader-sync-client.js
// A simple client for uploading files to our CDP service synchronously.
// This client wraps the three-step upload process into a single synchronous operation:
// 1. Initiate - Get upload & status URLs
// 2. Upload - Send the file data
// 3. Wait - Poll until processing completes

import FormData from 'form-data' // multipart formdata
import fetch from 'node-fetch'

export class CdpUploaderSyncClient {
  constructor (config = {}) {
    this.baseUrl = new URL(config.baseUrl || 'http://cdp-uploader:7337')
    this.s3Bucket = config.s3Bucket || 'fcp-sfd-uploads'
    this.redirectUrl = config.redirectUrl || 'http://development:3001/health'
  }

  // Step 1: Start upload process & get URLs
  async initiate () {
    // Send request to start a new upload
    const response = await fetch(new URL('initiate', this.baseUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        redirect: this.redirectUrl, // Where to redirect after upload
        s3Bucket: this.s3Bucket // Target bucket
      })
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Failed to initiate upload: ${text}`)
    }

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

  // Step 2: Upload the file(s)
  async uploadFile (uploadUrl, files, formFields = {}) {
    const form = new FormData()

    // Add all form fields
    Object.entries(formFields).forEach(([key, value]) => {
      form.append(key, value)
    })

    // Handle both single files and arrays of files
    if (Array.isArray(files)) {
      console.log('Processing array of files')
      files.forEach((file, index) => {
        form.append(`file${index + 1}`, file)
      })
    } else {
      console.log('Processing single file:', {
        type: typeof files,
        isBuffer: Buffer.isBuffer(files),
        hasStream: files.pipe !== undefined,
        keys: Object.keys(files)
      })
      form.append('file', files)
    }

    console.log('Uploading to URL:', uploadUrl)
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: form.getHeaders(),
      body: form
    })

    if (!uploadResponse.ok) {
      const text = await uploadResponse.text()
      throw new Error(`Upload failed with status ${uploadResponse.status}: ${text}`)
    }

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

      if (status.uploadStatus === 'ready' || status.uploadStatus === 'rejected') {
        return {
          uploadStatus: status.uploadStatus,
          form: status.form
        }
      }

      await new Promise(resolve => setTimeout(resolve, interval))
      attempts++
    }

    throw new Error('Upload processing timed out')
  }

  /**
   * Synchronous wrapper that handles the complete upload process in one call.
   * This is the main method that differentiates this client from the base client,
   * combining the three steps (initiate, upload, wait) into a single operation.
   */
  async uploadSync (files, formFields = {}) {
    try {
      // Step 1: Initiate the upload
      const { uploadUrl, statusUrl } = await this.initiate()

      // Step 2: Upload file(s) with form fields
      await this.uploadFile(uploadUrl, files, formFields)
      console.log('Files uploaded, waiting for processing...')

      // Step 3: Wait for completion and return final result
      const result = await this.waitForCompletion(statusUrl)
      console.log('Processing complete:', JSON.stringify(result, null, 2))

      return result
    } catch (error) {
      console.error('Upload sync failed:', error.message)
      throw error
    }
  }
}
