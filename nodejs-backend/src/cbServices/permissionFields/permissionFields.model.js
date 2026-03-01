module.exports = function (app) {
    const modelName = 'permission_fields';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            servicePermissionId: {
                type: Schema.Types.ObjectId,
                ref: 'permission_services',
                comment:
                    'Service Permission Id, dropdown, false, true, true, true, true, true, true, permissionServices, permission_services, one-to-one, service,'
            },
            fieldName: {
                type: String,
                maxLength: 1000,
                index: true,
                trim: true,
                comment:
                    'Field Name, p, false, true, true, true, true, true, true, , , , ,'
            },
            onCreate: {
                type: Boolean,
                required: false,
                default: true,
                comment:
                    'On Create, tick, false, true, true, true, true, true, true, , , , ,'
            },
            onUpdate: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'On Update, tick, false, true, true, true, true, true, true, , , , ,'
            },
            onDetail: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'On Detail, tick, false, true, true, true, true, true, true, , , , ,'
            },
            onTable: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'On Table, tick, false, true, true, true, true, true, true, , , , ,'
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
