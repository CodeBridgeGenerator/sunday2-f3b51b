module.exports = function (app) {
    const modelName = 'superiors';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            superior: {
                type: Schema.Types.ObjectId,
                ref: 'staffinfo',
                comment:
                    'Superior, dropdown, false, true, true, true, true, true, true, staffinfo, staffinfo, one-to-one, name,'
            },
            subordinate: {
                type: Schema.Types.ObjectId,
                ref: 'staffinfo',
                comment:
                    'Subordinate, dropdown, false, true, true, true, true, true, true, staffinfo, staffinfo, one-to-one, empno,'
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
