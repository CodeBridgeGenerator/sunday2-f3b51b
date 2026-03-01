module.exports = function (app) {
    const modelName = 'branches';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            companyId: {
                type: Schema.Types.ObjectId,
                ref: 'companies',
                comment:
                    'Company, dropdown, true, true, true, true, true, true, true, companies, companies, one-to-one, name,'
            },
            name: {
                type: String,
                required: true,
                maxLength: 150,
                trim: true,
                comment:
                    'Name, p, false, true, true, true, true, true, true, , , , ,'
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
