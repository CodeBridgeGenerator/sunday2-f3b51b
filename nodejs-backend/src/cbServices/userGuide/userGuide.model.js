module.exports = function (app) {
    const modelName = 'user_guide';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            serviceName: {
                type: String,
                required: true,
                comment:
                    'ServiceName, p, false, true, true, true, true, true, true, , , , ,'
            },
            expiry: {
                type: Date,
                comment:
                    'Expiry, p_date, false, true, true, true, true, true, true, , , , ,'
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
