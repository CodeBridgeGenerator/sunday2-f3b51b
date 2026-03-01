module.exports = function (app) {
    const modelName = 'departments';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            company: {
                type: Schema.Types.ObjectId,
                ref: 'companies',
                comment:
                    'Company, dropdown, true, true, true, true, true, true, true, companies, companies, one-to-one, name,'
            },
            deptName: {
                type: String,
                maxLength: 150,
                index: true,
                trim: true,
                comment:
                    'Dept Name, p, false, true, true, true, true, true, true, , , , ,'
            },
            code: {
                type: String,
                minLength: 2,
                maxLength: 150,
                trim: true,
                comment:
                    'Code, p, false, true, true, true, true, true, true, , , , ,'
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
