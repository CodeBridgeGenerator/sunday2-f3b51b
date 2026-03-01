const s3Client = require('./s3Client');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const URL = process.env.S3_URL;
const FOLDER = process.env.PROJECT_NAME;
const BUCKET = process.env.S3_BUCKET;

async function objectUpload2S3(request, response) {
    const { tableId, tableName, user } = request.body;
    const files = request.files; // Access uploaded files via request.files

    if (!files || files.length === 0) {
        return response.status(400).json({
            status: false,
            message: 'No files uploaded'
        });
    }

    try {
        const uploadPromises = files.map(async (file) => {
            const params = {
                Bucket: BUCKET,
                Key: `${FOLDER}/${file.originalname}`,
                Body: file.buffer,
                ContentType: file.mimetype
            };

            const s3Response = await s3Client.send(
                new PutObjectCommand(params)
            );

            if (typeof s3Response.VersionId === 'string') {
                // const url = `${URL}/${FOLDER}/${file.originalname}`;
                const url = `${URL}/${file.originalname}`;
                const data = {
                    lastModified: file.lastModified,
                    lastModifiedDate: new Date(),
                    name: file.originalname,
                    size: file.size,
                    path: `${FOLDER}/${file.originalname}`,
                    type: file.mimetype,
                    eTag: s3Response.ETag,
                    versionId: s3Response.VersionId,
                    url,
                    tableId,
                    tableName,
                    createdBy: user._id,
                    updatedBy: user._id
                };

                const createdDocument =
                    await request.appInstance.services.documentStorages.create(
                        data
                    );
                console.debug('File uploaded successfully:', createdDocument);

                return {
                    status: true,
                    message: 'File uploaded successfully',
                    url,
                    documentId: createdDocument._id
                };
            } else {
                const message = `Error uploading file: ${file.originalname}`;
                console.error(message);
                return { status: false, message };
            }
        });

        const results = await Promise.all(uploadPromises);

        // Check if any uploads failed
        const allUploadsSuccessful = results.every((result) => result.status);
        if (allUploadsSuccessful) {
            return response.status(200).json({
                status: true,
                message: 'Files uploaded successfully',
                results: results
            });
        } else {
            // At least one upload failed
            const failedUploads = results.filter((result) => !result.status);
            return response.status(500).json({
                status: false,
                message: 'Some files failed to upload',
                failedUploads: failedUploads
            });
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        return response
            .status(500)
            .json({ status: false, message: error.message });
    }
}

module.exports = objectUpload2S3;
