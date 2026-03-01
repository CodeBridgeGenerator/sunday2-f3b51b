module.exports = function (app) {
    const modelName = 'fcm_messages';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            title: {
                type: String,
                comment:
                    'Title, p, false, true, true, true, true, true, true, , , , ,'
            },
            body: {
                type: String,
                required: true,
                comment:
                    'Body, p, false, true, true, true, true, true, true, , , , ,'
            },
            recipients: {
                type: [Schema.Types.ObjectId],
                ref: 'users',
                description: 'isArray',
                comment:
                    'Recipients, multiselect, false, true, true, true, true, true, true, users, users, one-to-many, name,'
            },
            image: {
                type: String,
                comment:
                    'Image, p, false, true, true, true, true, true, true, , , , ,'
            },
            payload: {
                type: Schema.Types.Mixed,
                comment:
                    'payload, p, false, true, true, true, true, true, true, , , , ,'
            },
            status: {
                type: String,
                comment:
                    'Status, p, false, true, true, true, true, true, true, , , , ,'
            },
            successCount: {
                type: Number,
                max: 1000000,
                comment:
                    'successCount, p_number, false, true, true, true, true, true, true, , , , ,'
            },
            failureCount: {
                type: Number,
                max: 1000000,
                comment:
                    'failureCount, p_number, false, true, true, true, true, true, true, , , , ,'
            },

            createdBy: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                required: true
            },
            updatedBy: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                required: true
            }
        },
        {
            timestamps: true
        }
    );

    if (mongooseClient.modelNames().includes(modelName)) {
        mongooseClient.deleteModel(modelName);
    }
    return mongooseClient.model(modelName, schema);
};
