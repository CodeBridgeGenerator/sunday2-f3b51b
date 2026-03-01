module.exports = function (app) {
    const modelName = 'chatai_enabler';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            name: {
                type: String,
                comment:
                    'Name, p, false, true, true, true, true, true, true, , , , ,'
            },
            serviceName: {
                type: String,
                enum: ['A', 'B', 'C', 'D'],
                comment:
                    'Service Name, dropdownArray, false, true, true, true, true, true, true, , , , ,'
            },
            description: {
                type: String,
                comment:
                    'Description, editor, false, true, true, true, true, true, true, , , , ,'
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
