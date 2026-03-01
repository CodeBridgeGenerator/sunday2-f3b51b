import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import client from '../../../services/restClient';
import _ from 'lodash';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

const DynaLoaderEditDialogComponent = (props) => {
    const navigate = useNavigate();
    const [_entity, set_entity] = useState({});
    const [process, setProcess] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        set_entity(props.entity);
        if (props?.entity?._id) {
            try {
                setProcess([]);
                if (process?.length === 0) populateData();
            } catch (err) {
                props.alert({
                    type: 'error',
                    title: 'Created',
                    message: err
                });
            }
        }
    }, [props.entity]);

    const populateData = async () => {
        // console.log(props.entity);
        const dynafields = client.service('dynaFields').find({
            query: {
                dynaLoader: props.entity?._id,
                $sort: {
                    toRefService: 1
                }
            }
        });

        const fromDataPromise = props.entity.isFile ? client.service('fileUploadedImportStore').find({ query: { _id: props.entity.fileUploadedId } }) : client.service(props.entity.from).find({});
        const toDataPromise = client.service(props.entity.to2).find({});
        const dynaAllfields = client.service('dynaFields').find({});

        const results = await Promise.all([dynafields, fromDataPromise, toDataPromise, dynaAllfields]);

        await checkFields(results[0].data, results[1].data, results[2].data, results[3].data);
    };

    const checkFields = async (dynafields, fromData, toData, dynaAllfields) => {
        const objectIds = {};
        // console.debug(dynafields);
        // console.debug(dynaAllfields);
        const dynaRelFields = _.filter(dynaAllfields, {
            toService: dynafields[0].toService
        });
        fromData = props.entity.isFile ? fromData[0].data : fromData;
        // console.debug(fromData);
        // console.debug(fromData[0]?.data);
        dynafields?.forEach((field, i) => {
            console.log(field);
            let promise = client.service('users').find({});
            if (field?.toRefService) promise = client.service(field.toRefService).find({});
            if (field?.toService) promise = client.service(field.toService).find({});
            const obj = {
                fromData: _.uniq(_.map(fromData, field.from)),
                from: field.from,
                fromType: field.fromType,
                fromService: field.fromService,
                promise,
                toData: _.map(toData, field.to2),
                to2: field.to2,
                toType: field.toType,
                toService: field.toService,
                toRefService: field?.toRefService,
                identifier: field?.identifierFieldName
            };
            objectIds[i] = obj;
        });

        console.debug(objectIds);
        const promises = await Promise.all(
            Object.entries(objectIds)
                .filter((p) => p.promise)
                .map((obj) => {
                    obj[1].promise;
                })
        );
        let _process = [];
        Object.entries(objectIds).forEach(async (obj) => {
            if (obj[1]?.toRefService) {
                const l = await obj[1].promise;
                const toIds = _.uniq(_.map(l?.data, obj[1]?.identifier));
                const missing1 = _.difference(obj[1].fromData, toIds);
                // console.debug("toIds", toIds);
                // console.debug("fromData",obj[1].fromData);
                // console.debug("missing1", missing1);
                // console.debug("object", obj[1]);
                const missingSorted = missing1.sort((a, b) => String(a).localeCompare(String(b)));
                if (missing1?.length > 0) {
                    const process1 = missingSorted?.map((m) => {
                        if (obj[1]?.toRefService) {
                            const create = {};
                            let query = {};
                            query[obj[1].from] = m;
                            create['source'] = _.find(fromData, query);
                            create['loader'] = dynafields;
                            create['loaderFields'] = dynaAllfields;
                            return {
                                toRefService: obj[1]?.toRefService,
                                ...create,
                                value: m,
                                field: obj[1]?.identifier
                            };
                        } else return null;
                    });
                    _process = _process?.length > 0 && process1?.length > 0 ? _process.push(process1) : _process;
                }
            } else if (obj[1]?.toService) {
                const toIds = _.uniq(_.map(toData, obj[1]?.to2 || 'name'));
                const missing1 = _.difference(obj[1].fromData, toIds);
                // console.debug("toIds", toIds);
                // console.debug("fromData",obj[1].fromData);
                // console.debug("missing1", missing1);
                // console.debug("object", obj[1]);
                const missingSorted = missing1.sort((a, b) => String(a).localeCompare(String(b)));
                const process1 = missingSorted?.map((m) => {
                    const create = {};
                    let query = {};
                    query[obj[1].from] = m;
                    create['source'] = _.find(fromData, query);
                    create['loader'] = dynafields;
                    create['loaderFields'] = dynaRelFields;
                    return {
                        toService: obj[1]?.toService,
                        ...create,
                        value: m,
                        field: obj[1]?.to2
                    };
                });
                _process = _process?.length > 0 && process1?.length > 0 ? _process.push(process1) : process1;
            }
        });
        // console.debug(_process);
        setProcess(_process);
        // console.debug(objectIds);
    };

    const onCreateJobQue = async () => {
        setLoading(true);
        try {
            const start = Date.now();
            const _data = {
                dynaLoaderId: _entity?._id,
                name: _entity?.name,
                fromService: _entity?.from,
                toService: _entity?.to2,
                type: _entity?.upsert,
                isFile: _entity?.isFile,
                fileUploadedStorageId: _entity?.fileUploadedId,
                isKey: _entity?.isKey,
                toUpdate: _entity?.toUpdate,
                start: start,
                end: start,
                email: props.user?.email,
                createdBy: props.user._id,
                updatedBy: props.user._id
            };
            // console.debug(_data);
            const results = await client.service('jobQues').create(_data);
            props.alert({
                title: 'Data Loader',
                type: 'success',
                message: `Upload ${_entity?.name} Job Created`
            });
        } catch (error) {
            console.debug('error', error);
            props.alert({
                title: 'Data Loader',
                type: 'error',
                message: `Upload ${_entity?.name} Job Failed `
            });
        } finally {
            setLoading(false);
            props.onHide(true);
        }
    };

    const renderFooter = () => (
        <div className="flex justify-content-end">
            <Button text label="run job" icon="pi pi-send" className="mr-8" onClick={() => onCreateJobQue()} role="dynaLoader-run-button" />
            <Button label="close" className="p-button-text no-focus-effect p-button-secondary" onClick={props.onHide} />
        </div>
    );

    const renderActions = () => {
        console.debug(process);
        let processHtml = null;
        processHtml = process?.map((e, i) => (
            <>
                <div key={`prc-name${i}`} className="col-12 md:col-4">
                    <label className="mr-2">{i + 1}</label>
                    <label>{e?.loader[0]?.from}</label>
                </div>
                <div key={`prc-add${i}`} className="col-12 md:col-4 mb-1" style={{ maxWidth: '12vw' }}>
                    <Button key={`prc-link${i}`} icon="pi pi-plus" size="small" label={`${e?.value}`} onClick={() => goto(e.toRefService, e)}></Button>
                </div>
                <div key={`prc-source${i}`} className="col-12 col-offset-1 md:col-3">
                    <label> {e?.loader[0]?.to2}</label>
                    <label>{JSON.stringify(e.loaderFields)}</label>
                </div>
            </>
        ));

        return (
            <>
                <div key="a" className="col-6">
                    <label className="ml-3">from:</label>
                </div>
                <div key="b" className="col-6">
                    <h5>{_entity?.from} </h5>
                </div>
                <div key="c" className="col-6">
                    <label className="ml-3">Action:</label>
                </div>
                <div key="d" className="col-6">
                    <h5>{_entity?.upsert}</h5>
                </div>
                <div key="e" className="col-6">
                    <label className="ml-3">to:</label>
                </div>
                <div key="f" className="col-6">
                    <h5>{_entity?.to2}</h5>
                </div>
                {process?.length > 0 ? processHtml : null}
            </>
        );
    };

    const renderTypes = () => {
        const processHtml = process?.map((e, i) => (
            <>
                {/* <div key={`prc-name${i}`} className="col-12 md:col-4">
          <small>{e?.source["sectdesc"]}</small>
        </div> */}
                <div key={`prc-add${i}`} className="col-12 md:col-4 mb-1" style={{ maxWidth: '12vw' }}>
                    <Button key={`prc-link${i}`} icon="pi pi-plus" size="small" label={`${e?.value}`} onClick={() => goto(e?.toRefService, e)}></Button>
                </div>
                <div key={`prc-source${i}`} className="col-12 col-offset-1 md:col-4">
                    <small>to {e?.toRefService}</small>
                </div>
            </>
        ));

        return (
            <>
                <div className="col-12 md:col-4 mt-5">
                    <h5>Service: {_entity?.to2}</h5>
                </div>

                <div className="col-12 md:col-4 mt-5" style={{ maxWidth: '15vw' }}>
                    <h5>Action</h5>
                </div>
                <div className="col-12 col-offset-1 md:col-4 mt-5">
                    <h5>From {_entity?.from} and create in</h5>
                </div>
                {processHtml}
            </>
        );
    };

    const goto = (service, data) => {
        console.debug('location state', data);
        if (typeof service == 'undefined') {
            props.layoutCurrentTab2(data.toService);
            navigate(`/${data.toService}`, { state: { action: 'create', data } });
        } else {
            props.layoutCurrentTab2(service);
            navigate(`/${service}`, { state: { action: 'create', data } });
        }
    };

    return (
        <Dialog header={`DynaLoader : ${_entity?.name}`} visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: '40vw' }} className="min-w-max" footer={renderFooter()} resizable={false}>
            <div className="grid p-fluid overflow-y-auto" style={{ maxWidth: '65vw' }} role="dynaLoader-edit-dialog-component">
                {process?.length > 0 ? renderActions() : <div className="m-5">Save to run the dynaloder</div>}
                {process?.length > 0 ? renderTypes() : null}
            </div>
        </Dialog>
    );
};

const mapState = (state) => {
    const { user } = state.auth;
    return { user };
};
const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
    layoutCurrentTab: (bool) => dispatch.layout.activeTab(bool),
    layoutCurrentTab2: (bool) => dispatch.layout.activeTab2(bool)
});

export default connect(mapState, mapDispatch)(DynaLoaderEditDialogComponent);
