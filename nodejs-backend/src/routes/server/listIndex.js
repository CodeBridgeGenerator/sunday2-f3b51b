function getIndex(stratWith, lastNumber) {
    const today = new Date();
    return [stratWith, '/', today.getFullYear(), '/', today.getMonth() + 1, '/']
        .join('')
        .concat(String(lastNumber).padStart(6, '0'));
}

async function getQuotationIndex(request, response) {
    try {
        const indices = await request.appInstance
            .service('quotationsIndex')
            .find({});
        let result;
        if (indices && indices.data.length === 0) {
            result = {
                count: getIndex('QO', 1),
                index: 1
            };
            await request.appInstance.service('quotationsIndex').create(result);
        } else {
            const record = indices.data[0];
            record.index += 1;

            result = {
                count: getIndex('QO', record.index),
                index: record.index
            };
            await request.appInstance
                .service('quotationsIndex')
                .patch(record._id, result);
        }
        return response.status(200).json(result);
    } catch (err) {
        console.debug(err);
        return response.status(500).json({ err: err.message });
    }
}

async function getDeliveryIndex(request, response) {
    try {
        const indices = await request.appInstance
            .service('deliveryIndex')
            .find({});
        let result;
        if (indices && indices.data.length === 0) {
            result = {
                count: getIndex('DO', 1),
                index: 1
            };
            await request.appInstance.service('deliveryIndex').create(result);
        } else {
            const record = indices.data[0];
            record.index += 1;

            result = {
                count: getIndex('DO', record.index),
                index: record.index
            };
            await request.appInstance
                .service('deliveryIndex')
                .patch(record._id, result);
        }
        return response.status(200).json(result);
    } catch (err) {
        console.debug(err);
        return response.status(500).json({ err: err.message });
    }
}

module.exports = {
    getQuotationIndex,
    getDeliveryIndex
};
