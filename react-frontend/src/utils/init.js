import { isEmpty } from 'lodash';

const initilization = (init, fieldValues, setError) => {
    const error = {};
    fieldValues.forEach((fieldValue) => {
        Object.entries(init).forEach((val) => {
            // console.debug(val);
            // console.debug(val[1]);
            // console.debug(typeof val[1]);
            if (typeof val[1] === 'object' && fieldValue?.length > 0) {
                const query = {};
                query['name'] = val[1]?.value;
                const data = _.find(fieldValue, query);
                if (data) {
                    const rec = { _id: data?.value };
                    init[val[1].field] = rec;
                } else {
                    // console.debug(val[1]);
                    error[val[1].field] = `missing value ${val[1]?.value}`;
                }
            } else init[val[0]] = val[1];
        });
    });

    Object.entries(init).forEach((val) => {
        if (!isEmpty(init[val[1].field]) && !isEmpty(error[val[1].field])) {
            delete error[val[1].field];
        }
    });

    setError(error);
    return init;
};

export default initilization;
