import { faker } from '@faker-js/faker';
export default (user, count, DepartmentIds, HeadIds) => {
    let data = [];
    for (let i = 0; i < count; i++) {
        const fake = {
            Department: DepartmentIds[i % DepartmentIds.length],
            Head: HeadIds[i % HeadIds.length],

            updatedBy: user._id,
            createdBy: user._id
        };
        data = [...data, fake];
    }
    return data;
};
