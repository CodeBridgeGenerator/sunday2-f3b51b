module.exports = function (app) {
    const modelName = 'fcms';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            fcmId: {
                type: String,
                required: true,
                comment:
                    'fcmId, p, false, false, false, false, false, true, true, , , , ,'
            },
            device: {
                type: String,
                maxLength: 100,
                comment:
                    'Device, p, false, true, true, true, true, true, true, , , , ,'
            },
            valid: {
                type: Boolean,
                required: false,
                comment:
                    'Valid, p_boolean, false, false, false, false, false, true, true, , , , ,'
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
