module.exports = function (app) {
    const modelName = 'sections';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            departmentId: {
                type: Schema.Types.ObjectId,
                ref: 'departments',
                comment:
                    'Department, dropdown, true, true, true, true, true, true, true, departments, departments, one-to-one, deptName,'
            },
            name: {
                type: String,
                minLength: 3,
                maxLength: 1000000,
                index: true,
                trim: true,
                comment:
                    'Name, p, false, true, true, true, true, true, true, , , , ,'
            },
            code: {
                type: String,
                minLength: 2,
                maxLength: 1000000,
                index: true,
                trim: true,
                comment:
                    'Code, p, false, true, true, true, true, true, true, , , , ,'
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
