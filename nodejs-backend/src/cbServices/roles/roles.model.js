module.exports = function (app) {
    const modelName = 'roles';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            name: {
                type: String,
                minLength: 3,
                maxLength: 1000000,
                index: true,
                trim: true,
                comment:
                    'Name, p, false, true, true, true, true, true, true, , , , ,'
            },
            description: {
                type: String,
                minLength: 3,
                maxLength: 1000000,
                index: true,
                trim: true,
                comment:
                    'Description, inputTextarea, false, true, true, true, true, true, true, , , , ,'
            },
            isDefault: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'Is default, p_boolean, false, true, true, true, true, true, true, , , , ,'
            },

            createdBy: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                required: false
            },
            updatedBy: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                required: false
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
