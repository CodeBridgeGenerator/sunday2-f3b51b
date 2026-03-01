module.exports = function (app) {
    const modelName = 'audits';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            serviceName: {
                type: String,
                enum: ['A', 'B', 'C', 'D'],
                comment:
                    'Service Name, dropdownArray, false, true, true, true, true, true, true, , , , ,'
            },
            action: {
                type: String,
                maxLength: 150,
                comment:
                    'Action, p, false, true, true, true, true, true, true, , , , ,'
            },
            details: {
                type: String,
                comment:
                    'Details, p, false, true, true, true, true, true, true, , , , ,'
            },
            method: {
                type: String,
                required: true,
                comment:
                    'Method, p, false, true, true, true, true, true, true, , , , ,'
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
