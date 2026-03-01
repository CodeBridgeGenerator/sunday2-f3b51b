module.exports = function (app) {
    const modelName = 'user_guide_steps';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            userGuideID: {
                type: Schema.Types.ObjectId,
                ref: 'user_guide',
                comment:
                    'UserGuideID, dropdown, false, true, true, true, true, true, true, userGuide, user_guide, one-to-one, serviceName,'
            },
            Steps: {
                type: String,
                required: true,
                comment:
                    'Steps, p, false, true, true, true, true, true, true, , , , ,'
            },
            Description: {
                type: String,
                required: true,
                comment:
                    'Description, p, false, true, true, true, true, true, true, , , , ,'
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
