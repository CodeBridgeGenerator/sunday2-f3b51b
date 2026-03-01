import { faker } from '@faker-js/faker';
export default (user, count, departmentIdIds, employeesIds) => {
    let data = [];
    for (let i = 0; i < count; i++) {
        const fake = {
            departmentId: departmentIdIds[i % departmentIdIds.length],
            employees: employeesIds[i % employeesIds.length],

            updatedBy: user._id,
            createdBy: user._id
        };
        data = [...data, fake];
    }
    return data;
};
