module.exports = (Base) =>
    class FindService extends Base {
        async find(params) {
            try {
                console.log('find service', params);
                if (!params.query?.q) return super.find(params);
                const { q, to, from, field } = params.query;
                let { days } = params.query;
                let toDateAgo = new Date('1970-01-01T00:00:00Z');
                if (to)
                    toDateAgo = Date.parse(to) > 0 ? new Date(to) : toDateAgo;
                let fromDateAgo = new Date();
                if (from)
                    fromDateAgo =
                        Date.parse(from) > 0 ? new Date(from) : fromDateAgo;
                if (!isNaN(days) && !to)
                    toDateAgo.setDate(fromDateAgo.getDate() - days);
                else days = fromDateAgo.getDate() - toDateAgo.getDate();

                if (q === 'unique') {
                    if (field) {
                        return await this.Model.distinct(field);
                    } else return { error: 'field not found' };
                }

                if (q === 'aggregate') {
                    return await this.Model.aggregate([
                        {
                            $match: {
                                createdAt: {
                                    $gte: toDateAgo,
                                    $lte: fromDateAgo
                                } // filter only recent docs
                            }
                        },
                        {
                            $group: {
                                _id: '$status',
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                status: '$_id',
                                count: 1
                            }
                        }
                    ]);
                }

                if (q === 'range') {
                    const result = await this.Model.aggregate([
                        {
                            $match: {
                                createdAt: {
                                    $gte: toDateAgo,
                                    $lte: fromDateAgo
                                } // only include recent documents
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                firstDate: { $min: '$createdAt' },
                                lastDate: { $max: '$createdAt' }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                firstDate: 1,
                                lastDate: 1,
                                daysAgo: { $literal: days }
                            }
                        }
                    ]);

                    return (
                        result[0] || {
                            firstDate: null,
                            lastDate: null,
                            daysAgo: days
                        }
                    );
                }

                if (q === 'count') {
                    const total = await this.Model.countDocuments({
                        createdAt: { $gte: toDateAgo, $lte: fromDateAgo }
                    });

                    return { total };
                }

                if (q === 'search') {
                    const { query, filter } = params.query;
                    if (!query || !filter) {
                        const results = await this.search(query, filter);
                        return { results };
                    }
                }
                return super.find(params);
            } catch (err) {
                console.log(err);
            }
        }

        async search(query, filter) {
            const allItems = await super.find(query);
            return Array.isArray(allItems)
                ? allItems.filter((item) => this.matchSearch(item, filter))
                : [allItems].filter((item) => this.matchSearch(item, filter));
        }

        matchSearch(item, query) {
            return JSON.stringify(item)
                .toLocaleLowerCase()
                .includes(query.toLocaleLowerCase());
        }
    };
