module.exports = function (app) {
    const modelName = 'help_sidebar_contents';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            serviceName: {
                type: String,
                comment:
                    'Service Name, p, false, true, true, true, true, true, true, , , , ,'
            },
            content: {
                type: String,
                required: true,
                comment:
                    'Content, editor, false, true, true, true, true, true, true, , , , ,'
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
