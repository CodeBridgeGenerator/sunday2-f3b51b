module.exports = function (app) {
    const modelName = 'employees';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            empNo: {
                type: String,
                required: true,
                comment:
                    'Emp No, p, false, true, true, true, true, true, true, , , , ,'
            },
            name: {
                type: String,
                required: true,
                comment:
                    'Name, p, false, true, true, true, true, true, true, , , , ,'
            },
            fullname: {
                type: String,
                required: true,
                comment:
                    'Fullname, p, false, true, true, true, true, true, true, , , , ,'
            },
            company: {
                type: Schema.Types.ObjectId,
                ref: 'companies',
                comment:
                    'Company, dropdown, false, true, true, true, true, true, true, companies, companies, one-to-one, name,'
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
            position: {
                type: Schema.Types.ObjectId,
                ref: 'positions',
                comment:
                    'Position, dropdown, false, true, true, true, true, true, true, positions, positions, one-to-one, name,'
            },
            supervisor: {
                type: Schema.Types.ObjectId,
                ref: 'employees',
                comment:
                    'Supervisor, dropdown, false, true, true, true, true, true, true, employees, employees, one-to-one, name,'
            },
            dateJoined: {
                type: Date,
                comment:
                    'Date Joined, p_calendar, false, true, true, true, true, true, true, , , , ,'
            },
            dateTerminated: {
                type: Date,
                comment:
                    'Date Terminated, p_calendar, false, true, true, true, true, true, true, , , , ,'
            },
            resigned: {
                type: String,
                required: true,
                comment:
                    'Resigned, p, false, true, true, true, true, true, true, , , , ,'
            },
            empGroup: {
                type: String,
                required: true,
                comment:
                    'Emp Group, p, false, true, true, true, true, true, true, , , , ,'
            },
            empCode: {
                type: String,
                required: true,
                comment:
                    'Emp Code, p, false, true, true, true, true, true, true, , , , ,'
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
