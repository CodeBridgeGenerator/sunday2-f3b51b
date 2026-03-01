module.exports = function (app) {
    const modelName = 'uploader';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            serviceName: {
                type: String,
                comment:
                    'Service Name, p, false, true, true, true, true, true, true, , , , ,'
            },
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                comment:
                    'User, dropdown, false, true, true, true, true, true, true, users, users, one-to-one, name,'
            },
            results: {
                type: Schema.Types.Mixed,
                comment:
                    'Results, pre, false, true, true, true, true, true, true, , , , ,'
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
