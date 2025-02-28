
# CDP Uploader Service Integration

This repository demonstrates service-to-service file uploads using the CDP Uploader service.

## Setup

1. Start the CDP Uploader and required services:

```bash
docker compose pull
docker compose up
```

This will start:
- Redis
- Localstack (AWS emulator)
- CDP Uploader (on port 7337)

2. The compose setup will automatically create:
- Required SQS queues
- S3 buckets (including 'my-bucket' for testing)

## Running the Example

The example script demonstrates the complete upload flow:

```bash
node src/examples/upload-example.js
```

This will:
1. Create a test file
2. Initiate an upload with CDP Uploader
3. Upload the file
4. Wait for processing to complete
5. Display the results

## Integration Flow

The CDP Uploader integration follows these steps:

1. **Initiate Upload**
   - POST to `/initiate`
   - Receive `uploadId` and URLs

2. **Upload File**
   - POST file to `/upload-and-scan/{uploadId}`
   - File goes to quarantine bucket

3. **Check Status**
   - GET `/status/{uploadId}`
   - Poll until complete or rejected

4. **Access File**
   - Once complete, file is available in destination S3 bucket
   - Location details in status response

## Error Handling

The implementation includes:
- Proper error handling for all API calls
- Status polling with timeout
- File rejection handling
- Virus scan result handling

## Testing

To test with virus detection:
- Include the word "virus" in any test filename
- The file will be rejected as infected

## Configuration

Default configuration:
- CDP Uploader URL: http://localhost:7337
- Default bucket: my-bucket

These can be customized when creating the client:

```javascript
const client = new CdpUploaderClient({
  baseUrl: 'http://localhost:7337',
  s3Bucket: 'custom-bucket'
  })
```
