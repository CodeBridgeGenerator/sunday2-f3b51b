module.exports = function (app) {
    const modelName = 'user_invites';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            emailToInvite: {
                type: String,
                required: true,
                comment:
                    'Email To Invite, p, false, true, true, true, true, true, true, , , , ,'
            },
            status: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'Status, p_boolean, false, true, true, true, true, true, true, , , , ,'
            },
            position: {
                type: Schema.Types.ObjectId,
                ref: 'positions',
                comment:
                    'Position, dropdown, false, true, true, true, true, true, true, positions, positions, one-to-one, name,'
            },
            role: {
                type: Schema.Types.ObjectId,
                ref: 'roles',
                comment:
                    'Role, dropdown, false, true, true, true, true, true, true, roles, roles, one-to-one, name,'
            },
            company: {
                type: Schema.Types.ObjectId,
                ref: 'companies',
                comment:
                    'Company, dropdown, false, true, true, true, true, true, true, companies, companies, one-to-one, name,'
            },
            branch: {
                type: Schema.Types.ObjectId,
                ref: 'branches',
                comment:
                    'Branch, dropdown, false, true, true, true, true, true, true, branches, branches, one-to-one, companyId,'
            },
            department: {
                type: Schema.Types.ObjectId,
                ref: 'departments',
                comment:
                    'Department, dropdown, false, true, true, true, true, true, true, departments, departments, one-to-one, deptName,'
            },
            section: {
                type: Schema.Types.ObjectId,
                ref: 'sections',
                comment:
                    'Section, dropdown, false, true, true, true, true, true, true, sections, sections, one-to-one, name,'
            },
            code: {
                type: Number,
                max: 1000000,
                comment:
                    'Code, p_number, false, false, false, false, false, true, true, , , , ,'
            },
            sendMailCounter: {
                type: Number,
                max: 1000000,
                comment:
                    'Send Mail Counter, p_number, false, true, true, true, true, true, true, , , , ,'
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
