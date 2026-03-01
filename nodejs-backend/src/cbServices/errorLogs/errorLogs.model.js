module.exports = function (app) {
    const modelName = 'error_logs';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            serviceName: {
                type: String,
                comment:
                    'Service Name, p, false, true, true, true, true, true, true, , , , ,'
            },
            errorMessage: {
                type: String,
                comment:
                    'Error Message, p, false, true, true, true, true, true, true, , , , ,'
            },
            message: {
                type: Schema.Types.Mixed,
                comment:
                    'Message, pre, false, true, true, true, true, true, true, , , , ,'
            },
            requestBody: {
                type: Schema.Types.Mixed,
                comment:
                    'Request Body, pre, false, true, true, true, true, true, true, , , , ,'
            },
            stack: {
                type: String,
                comment:
                    'Stack, p, false, true, true, true, true, true, true, , , , ,'
            },
            details: {
                type: String,
                comment:
                    'Details, p, false, true, true, true, true, true, true, , , , ,'
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
