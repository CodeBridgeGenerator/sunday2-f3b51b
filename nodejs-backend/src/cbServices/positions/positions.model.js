module.exports = function (app) {
    const modelName = 'positions';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            roleId: {
                type: Schema.Types.ObjectId,
                ref: 'roles',
                comment:
                    'Role, dropdown, true, true, true, true, true, true, true, roles, roles, one-to-one, name,'
            },
            name: {
                type: String,
                minLength: 3,
                maxLength: 100000000,
                index: true,
                trim: true,
                comment:
                    'Name, p, false, true, true, true, true, true, true, , , , ,'
            },
            description: {
                type: String,
                minLength: 3,
                maxLength: 100000000,
                index: true,
                trim: true,
                comment:
                    'Description, inputTextarea, false, true, true, true, true, true, true, , , , ,'
            },
            abbr: {
                type: String,
                minLength: 2,
                maxLength: 1000000,
                index: true,
                trim: true,
                comment:
                    'Abbr, p, false, true, true, true, true, true, true, , , , ,'
            },
            isDefault: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'Is default, tick, false, true, true, true, true, true, true, , , , ,'
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
