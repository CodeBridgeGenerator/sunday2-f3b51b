import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import client from '../../../services/restClient';
import _ from 'lodash';
import initilization from '../../../utils/init';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { InputMask } from 'primereact/inputmask';
const typeArray = ['Land line', 'Mobile', 'Fax', 'WA Only', 'SMS Only'];
const typeOptions = typeArray.map((x) => ({ name: x, value: x }));
import { getSchemaValidationErrorsStrings, updateMany } from '../../../utils';
import countries from '../../../resources/countries.json';
import parsePhoneNumber from 'libphonenumber-js';

const CompanyPhonesCreateDialogComponent = (props) => {
    const [_entity, set_entity] = useState({});
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const urlParams = useParams();
    const [companyId, setCompanyId] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    countries.sort((a, b) => a.name.localeCompare(b.name));

    useEffect(() => {
        let init = { isDefault: false };
        if (!_.isEmpty(props?.entity)) {
            init = initilization({ ...props?.entity, ...init }, [companyId], setError);
        }
        set_entity({ ...init });
    }, [props.show]);

    const validate = () => {
        let ret = true;
        const error = {};
        if (_.isEmpty(_entity?.number)) {
            error['number'] = `Phone number is required`;
            ret = false;
        }

        if (_.isEmpty(_entity?.companyId)) {
            error['companyId'] = `Company is required`;
            ret = false;
        }

        if (_.isEmpty(_entity?.type)) {
            error['type'] = `Phone type is required`;
            ret = false;
        }

        if (_.isEmpty(_entity?.countryCode)) {
            error['countryCode'] = `Phone Country Code is required`;
            ret = false;
        }

        if (!ret) setError(error);
        return ret;
    };

    const onSave = async () => {
        if (!validate()) return;
        let _data = {
            companyId: _entity?.companyId?._id,
            countryCode: _entity?.countryCode,
            operatorCode: _entity?.operatorCode,
            number: _entity?.number,
            type: _entity?.type,
            isDefault: _entity?.isDefault || false,
            createdBy: props.user._id,
            updatedBy: props.user._id
        };

        setLoading(true);

        if (_entity?.isDefault) {
            const updated = await updateMany({
                collection: 'company_phones',
                query: {
                    type: _entity?.type,
                    companyId: _entity?.companyId?._id
                },
                update: { isDefault: false },
                user: props.user
            });
        } else {
            const validResult = await client.service('companyPhones').find({
                query: { type: _entity?.type, userId: _entity?.userId?._id }
            });
            if (validResult.total <= 1) _entity.isDefault = true;
        }

        try {
            const result = await client.service('companyPhones').create(_data);
            const eagerResult = await client.service('companyPhones').find({
                query: {
                    $limit: 10000,
                    _id: { $in: [result._id] },
                    $populate: [
                        {
                            path: 'companyId',
                            service: 'companies',
                            select: ['name']
                        }
                    ]
                }
            });
            props.onHide();
            props.alert({
                type: 'success',
                title: 'Create info',
                message: 'Info Company Phones updated successfully'
            });
            props.onCreateResult(eagerResult.data[0]);
        } catch (error) {
            console.debug('error', error);
            setError(getSchemaValidationErrorsStrings(error) || 'Failed to create');
            props.alert({
                type: 'error',
                title: 'Create',
                message: 'Failed to create in Company Phones'
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        // on mount companies
        client
            .service('companies')
            .find({
                query: {
                    $limit: 10000,
                    $sort: { createdAt: -1 },
                    _id: urlParams.singleCompaniesId
                }
            })
            .then((res) => {
                setCompanyId(
                    res.data.map((e) => {
                        return { name: e['name'], value: e._id };
                    })
                );
            })
            .catch((error) => {
                console.debug({ error });
                props.alert({
                    title: 'Companies',
                    type: 'error',
                    message: error.message || 'Failed get companies'
                });
            });
    }, []);

    const selectedCountryTemplate = (option, props) => {
        if (option) {
            return (
                <div className="flex align-items-center">
                    <img alt={option.name} src={`assets/png100px/${option.code.toLowerCase()}.png`} className={`mr-2 flag flag-${option.code.toLowerCase()}`} style={{ width: '18px' }} />
                    <div>{option.name}</div>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };

    const countryOptionTemplate = (option) => {
        return (
            <div className="flex align-items-center">
                <img alt={option.name} src={`assets/png100px/${option.code.toLowerCase()}.png`} className={`mr-2 flag flag-${option.code.toLowerCase()}`} style={{ width: '18px' }} />
                <div>{option.name}</div>
            </div>
        );
    };

    const setPhoneNumber = (number) => {
        setError({});
        const phoneNumber = parsePhoneNumber(number, selectedCountry.code.toUpperCase());

        if (phoneNumber && phoneNumber.isPossible()) {
            set_entity({
                countryCode: phoneNumber?.countryCallingCode,
                operatorCode: number.substring(1, 3),
                number: phoneNumber?.number
            });
        } else {
            props.alert({
                title: 'Phone Number',
                type: 'error',
                message: 'Phone invalid'
            });
            if (phoneNumber && !phoneNumber.isValid()) {
                error['number'] = `Phone number is required`;
                setError(error);
            }
        }
    };

    const renderFooter = () => (
        <div className="flex justify-content-end">
            <Button label="save" className="p-button-text no-focus-effect" onClick={onSave} loading={loading} />
            <Button label="close" className="p-button-text no-focus-effect p-button-secondary" onClick={props.onHide} />
        </div>
    );

    const setValByKey = (key, val) => {
        let new_entity = { ..._entity, [key]: val };
        set_entity(new_entity);
        setError({});
    };

    const companyIdOptions = companyId.map((elem) => ({
        name: elem.name,
        value: elem.value
    }));

    return (
        <Dialog header="Add Company Phone" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: '40vw' }} className="min-w-max" footer={renderFooter()} resizable={false}>
            <div className="grid p-fluid overflow-y-auto" style={{ maxWidth: '55vw' }} role="companyPhones-create-dialog-component">
                <div className="col-12 field">
                    <span className="align-items-center">
                        <label htmlFor="companyId">Company:</label>
                        <Dropdown id="companyId" value={_entity?.companyId?._id} optionLabel="name" optionValue="value" options={companyIdOptions} onChange={(e) => setValByKey('companyId', { _id: e.value })} />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['companyId']) ? (
                            <p className="m-0" key="error-companyId">
                                {error['companyId']}
                            </p>
                        ) : null}
                    </small>
                </div>

                <div className="col-4">
                    <span className="align-items-center">
                        <label htmlFor="country" className="font-bold block mb-2">
                            Country:
                        </label>
                        <Dropdown
                            id="country"
                            key="country"
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.value)}
                            options={countries}
                            optionLabel="name"
                            placeholder="Select a Country"
                            filter
                            valueTemplate={selectedCountryTemplate}
                            itemTemplate={countryOptionTemplate}
                            className="w-full md:w-14rem"
                        />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['countryCode']) ? (
                            <p className="m-0" key="error-countryCode">
                                {error['countryCode']}
                            </p>
                        ) : null}
                    </small>
                </div>

                <div className="col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="number">Enter Number:</label>
                        <InputMask id="phone" mask="(99) 999 - 9999?" placeholder="+(99) 999 - 99999" onComplete={(e) => setPhoneNumber(e.value)}></InputMask>
                    </span>
                </div>
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="type">Type:</label>
                        <Dropdown id="type" value={_entity?.type} options={typeOptions} optionLabel="name" optionValue="value" onChange={(e) => setValByKey('type', e.value)} />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['type']) ? (
                            <p className="m-0" key="error-type">
                                {error['type']}
                            </p>
                        ) : null}
                    </small>
                </div>
                <div className="col-12 md:col-2 field flex">
                    <span className="align-items-center">
                        <label htmlFor="isDefault">Is Default:</label>
                        <Checkbox id="isDefault" className="ml-3" checked={_entity?.isDefault} onChange={(e) => setValByKey('isDefault', e.checked)} />
                    </span>
                </div>
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
    hasServicePermission: (service) => dispatch.perms.hasServicePermission(service),
    hasServiceFieldsPermission: (service) => dispatch.perms.hasServiceFieldsPermission(service)
});

export default connect(mapState, mapDispatch)(CompanyPhonesCreateDialogComponent);
