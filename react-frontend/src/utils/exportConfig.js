import map from 'lodash/map';

const exportConfig = {
    fields: {
        machineImage: {
            format: (value) => {
                if (!Array.isArray(value)) return 'No Images';
                const urls = map(value, (doc) => doc.url || 'Unknown URL');
                return urls.join(', ');
            }
        }
    }
};

export default exportConfig;
