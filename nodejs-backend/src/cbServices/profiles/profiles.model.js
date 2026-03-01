module.exports = function (app) {
    const modelName = 'profiles';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            name: {
                type: String,
                required: true,
                comment:
                    'Name, p, false, true, true, true, true, true, true, , , , ,'
            },
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                comment:
                    'User, dropdown, true, true, true, true, true, true, true, users, users, one-to-one, name,'
            },
            image: {
                type: String,
                required: true,
                comment:
                    'Image, image, false, true, true, true, true, true, true, , , , ,'
            },
            bio: {
                type: String,
                minLength: 3,
                maxLength: 1000000,
                index: true,
                trim: true,
                comment:
                    'Bio, inputTextarea, false, true, true, true, true, true, true, , , , ,'
            },
            department: {
                type: Schema.Types.ObjectId,
                ref: 'departments',
                comment:
                    'Department, dropdown, false, true, true, true, true, true, true, departments, departments, one-to-one, deptName,'
            },
            hod: {
                type: Boolean,
                required: true,
                default: false,
                comment:
                    'Head of Department, tick, false, true, true, true, true, true, true, , , , ,'
            },
            section: {
                type: Schema.Types.ObjectId,
                ref: 'sections',
                comment:
                    'Section, dropdown, true, true, true, true, true, true, true, sections, sections, one-to-one, name,'
            },
            hos: {
                type: Boolean,
                required: true,
                default: false,
                comment:
                    'Head of Section, tick, false, true, true, true, true, true, true, , , , ,'
            },
            role: {
                type: Schema.Types.ObjectId,
                ref: 'roles',
                comment:
                    'Role, dropdown, false, true, true, true, true, true, true, roles, roles, one-to-one, name,'
            },
            position: {
                type: Schema.Types.ObjectId,
                ref: 'positions',
                comment:
                    'Position, dropdown, true, true, true, true, true, true, true, positions, positions, one-to-one, name,'
            },
            manager: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                comment:
                    'Manager, dropdown, false, true, true, true, true, true, true, users, users, one-to-one, name,'
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
                    'Branch, dropdown, false, true, true, true, true, true, true, branches, branches, one-to-one, name,'
            },
            skills: {
                type: [String],
                minLength: 3,
                maxLength: 100000000,
                index: true,
                trim: true,
                comment:
                    'Skills, chip, false, true, true, true, true, true, true, , , , ,'
            },
            address: {
                type: Schema.Types.ObjectId,
                ref: 'user_addresses',
                comment:
                    'Address, dropdown, false, true, true, true, true, true, true, userAddresses, user_addresses, one-to-one, Street1,'
            },
            phone: {
                type: Schema.Types.ObjectId,
                ref: 'user_phones',
                comment:
                    'Phone, dropdown, false, true, true, true, true, true, true, userPhones, user_phones, one-to-one, number,'
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
