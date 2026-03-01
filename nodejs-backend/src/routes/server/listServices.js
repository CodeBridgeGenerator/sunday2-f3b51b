async function listServices(request, response) {
    const excludes = [
        'audits',
        'authentication',
        'cache/clear/all',
        'cache/clear/group',
        'cache/clear/single',
        'cache/clear/single',
        'cache/flashdb',
        'comments',
        'config'
    ];

    try {
        let data = Object.keys(request.appInstance.services);
        if (data) {
            data = data
                .filter((s) => !excludes.includes(s))
                .sort((a, b) => a.localeCompare(b));
            return response
                .status(200)
                .json({ status: true, message: 'success', data });
        } else {
            return response
                .status(500)
                .json({ status: false, message: 'data empty' });
        }
    } catch (error) {
        return response.status(500).json({ status: false, message: error });
    }
}

module.exports = listServices;
