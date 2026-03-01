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
                    'ServicePermissionId, dropdown, false, true, true, true, true, true, true, permissionServices, permission_services, one-to-one, service,'
            },
            fieldName: {
                type: String,
                minLength: 3,
                maxLength: 1000000,
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
                    'OnCreate, p_boolean, false, true, true, true, true, true, true, , , , ,'
            },
            onUpdate: {
                type: Boolean,
                required: false,
                default: true,
                comment:
                    'OnUpdate, p_boolean, false, true, true, true, true, true, true, , , , ,'
            },
            onDetail: {
                type: Boolean,
                required: false,
                default: true,
                comment:
                    'OnDetail, p_boolean, false, true, true, true, true, true, true, , , , ,'
            },
            onTable: {
                type: Boolean,
                required: false,
                default: true,
                comment:
                    'OnTable, p_boolean, false, true, true, true, true, true, true, , , , ,'
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
