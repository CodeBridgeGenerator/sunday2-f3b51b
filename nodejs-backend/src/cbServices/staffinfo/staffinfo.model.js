module.exports = function (app) {
    const modelName = 'staffinfo';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            empNo: {
                type: Number,
                max: 1000000,
                comment:
                    'Emp No, p_number, false, true, true, true, true, true, true, , , , ,'
            },
            name: {
                type: String,
                minLength: 2,
                maxLength: 1000,
                index: true,
                trim: true,
                comment:
                    'Name, p, false, true, true, true, true, true, true, , , , ,'
            },
            nameNric: {
                type: String,
                minLength: 2,
                maxLength: 1000,
                index: true,
                trim: true,
                comment:
                    'Name NRIC, p, false, true, true, true, true, true, true, , , , ,'
            },
            compCode: {
                type: Number,
                max: 10000000,
                comment:
                    'Comp Code, p_number, false, true, true, true, true, true, true, , , , ,'
            },
            compName: {
                type: String,
                minLength: 2,
                maxLength: 1000,
                index: true,
                trim: true,
                comment:
                    'Comp Name, p, false, true, true, true, true, true, true, , , , ,'
            },
            deptCode: {
                type: String,
                minLength: 2,
                maxLength: 1000,
                index: true,
                trim: true,
                comment:
                    'Dept Code, p, false, true, true, true, true, true, true, , , , ,'
            },
            deptDesc: {
                type: String,
                minLength: 2,
                maxLength: 1000,
                index: true,
                trim: true,
                comment:
                    'Dept Desc, p, false, true, true, true, true, true, true, , , , ,'
            },
            sectCode: {
                type: Number,
                max: 50035066,
                comment:
                    'Sect Code, p_number, false, true, true, true, true, true, true, , , , ,'
            },
            sectDesc: {
                type: String,
                minLength: 2,
                maxLength: 1000,
                index: true,
                trim: true,
                comment:
                    'Sect Desc, p, false, true, true, true, true, true, true, , , , ,'
            },
            designation: {
                type: String,
                minLength: 2,
                maxLength: 1000,
                index: true,
                trim: true,
                comment:
                    'Designation, p, false, true, true, true, true, true, true, , , , ,'
            },
            email: {
                type: String,
                minLength: 2,
                maxLength: 1000,
                index: true,
                trim: true,
                comment:
                    'Email, p, false, true, true, true, true, true, true, , , , ,'
            },
            resign: {
                type: String,
                minLength: 2,
                maxLength: 1000,
                index: true,
                trim: true,
                comment:
                    'Resign, p, false, true, true, true, true, true, true, , , , ,'
            },
            supervisor: {
                type: String,
                minLength: 2,
                maxLength: 1000,
                index: true,
                trim: true,
                comment:
                    'Supervisor, p, false, true, true, true, true, true, true, , , , ,'
            },
            dateJoin: {
                type: Number,
                max: 10000000,
                comment:
                    'Date Join, p_number, false, true, true, true, true, true, true, , , , ,'
            },
            empGroup: {
                type: String,
                minLength: 2,
                maxLength: 1000,
                index: true,
                trim: true,
                comment:
                    'Emp Group, p, false, true, true, true, true, true, true, , , , ,'
            },
            empGradeCode: {
                type: String,
                minLength: 2,
                maxLength: 1000,
                index: true,
                trim: true,
                comment:
                    'Emp Grade Code, p, false, true, true, true, true, true, true, , , , ,'
            },
            terminationDate: {
                type: String,
                minLength: 2,
                maxLength: 1000,
                index: true,
                trim: true,
                comment:
                    'Termination Date, p, false, true, true, true, true, true, true, , , , ,'
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
