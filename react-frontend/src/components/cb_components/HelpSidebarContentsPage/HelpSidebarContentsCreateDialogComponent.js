import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import client from '../../../services/restClient';
import _ from 'lodash';
import initilization from '../../../utils/init';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Editor } from 'primereact/editor';
import { Dropdown } from 'primereact/dropdown';
import axios from 'axios';

const getSchemaValidationErrorsStrings = (errorObj) => {
    let errMsg = {};
    for (const key in errorObj.errors) {
        if (Object.hasOwnProperty.call(errorObj.errors, key)) {
            const element = errorObj.errors[key];
            if (element?.message) {
                errMsg[key] = element.message;
            }
        }
    }
    return errMsg.length ? errMsg : errorObj.message ? { error: errorObj.message } : {};
};

const HelpSidebarContentsCreateDialogComponent = (props) => {
    const [_entity, set_entity] = useState({});
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const [serviceOptions, setServiceOptions] = useState([]);
    const urlParams = useParams();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const apiUrl = process.env.REACT_APP_SERVER_URL + '/listServices';
                const response = await axios.get(apiUrl);
                if (response.data?.status && response.data?.data) {
                    setServiceOptions(response.data.data);
                } else {
                    console.error('Failed to fetch service options:', response.data);
                }
            } catch (err) {
                console.error('Error fetching services:', err);
            }
        };
        fetchServices();
    }, []);

    const initialContentTemplate = `<p><strong>Purpose:</strong> [Briefly describe the purpose of this service/feature.]</p>
  <p><strong>How to Access:</strong> [Explain how users can navigate to this service within the application.  Be specific, e.g., "Navigate to Main Menu > Settings > Users".]</p>

  <p><strong>Features: </strong>  </p>
  <ul><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Add, view, and update company details.</li></ul> 
 
  <p><strong>Guide: </strong></p>
  <ol>
  <li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>Click "Add" to create a new company entry.</li>
  <li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>Fill in details such as company name, registration number, and address.</li>
  <li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>Click "Save" to add the company to the system.</li>
  <li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>Select an existing company to edit or update its information.</li>
  </ol>`;

    useEffect(() => {
        let init = {};
        if (!_.isEmpty(props?.entity)) {
            init = initilization({ ...props?.entity, ...init }, [], setError);
            set_entity({ ...init });
        } else {
            set_entity({ content: initialContentTemplate });
        }

        setError({});
    }, [props.show]);

    const validate = () => {
        let ret = true;
        const error = {};

        if (_.isEmpty(_entity?.serviceName)) {
            error['serviceName'] = `Table Name field is required`;
            ret = false;
        }

        if (!ret) setError(error);
        return ret;
    };

    const onSave = async () => {
        if (!validate()) return;
        let _data = {
            serviceName: _entity?.serviceName,
            purpose: _entity?.purpose,
            path: _entity?.path,
            features: _entity?.features,
            guide: _entity?.guide,
            video: _entity?.video,
            content: _entity?.content,
            createdBy: props.user._id,
            updatedBy: props.user._id
        };

        setLoading(true);

        try {
            const result = await client.service('helpSidebarContents').create(_data);
            props.onHide();
            props.alert({
                type: 'success',
                title: 'Create info',
                message: 'Info HelpSidebarContents created successfully'
            });
            props.onCreateResult(result);
        } catch (error) {
            console.debug('error', error);
            setError(getSchemaValidationErrorsStrings(error) || 'Failed to create');
            props.alert({
                type: 'error',
                title: 'Create',
                message: 'Failed to create in HelpSidebarContents'
            });
        }
        setLoading(false);
    };

    const renderHeader = () => {
        return (
            <span className="ql-formats">
                <button className="ql-bold" aria-label="Bold"></button>
                <button className="ql-italic" aria-label="Italic"></button>
                <button className="ql-underline" aria-label="Underline"></button>
                <button className="ql-list" value="ordered" aria-label="Ordered List"></button>
                <button className="ql-list" value="bullet" aria-label="Unordered List"></button>
                <button className="ql-link" aria-label="Insert Link"></button>
            </span>
        );
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

    return (
        <Dialog header="Create Helpbar Contents" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: '40vw' }} className="min-w-max scalein animation-ease-in-out animation-duration-1000" footer={renderFooter()} resizable={false}>
            <div className="grid p-fluid overflow-y-auto" style={{ maxWidth: '55vw' }} role="helpSidebarContents-create-dialog-component">
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="serviceName">Service:</label>
                        {/* <InputText id="serviceName" className="w-full mb-3 p-inputtext-sm" value={_entity?.serviceName} onChange={(e) => setValByKey("serviceName", e.target.value)} required /> */}
                        <Dropdown
                            id="serviceName"
                            className="w-full mb-3 mt-2"
                            value={_entity?.serviceName}
                            options={serviceOptions}
                            onChange={(e) => setValByKey('serviceName', e.value)}
                            filter // Enables the search functionality
                            filterBy="serviceName" // Field to search by in the dropdown options
                            placeholder="Select a Service"
                        />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['serviceName']) ? (
                            <p className="m-0" key="error-serviceName">
                                {error['serviceName']}
                            </p>
                        ) : null}
                    </small>
                </div>
                {/* <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="purpose">Purpose:</label>
            <InputText id="purpose" className="w-full mb-3 p-inputtext-sm" value={_entity?.purpose} onChange={(e) => setValByKey("purpose", e.target.value)} required />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["purpose"]) ? (
              <p className="m-0" key="error-purpose">
                {error["purpose"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="path">Path:</label>
            <InputText id="path" className="w-full mb-3 p-inputtext-sm" value={_entity?.path} onChange={(e) => setValByKey("path", e.target.value)} required />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["path"]) ? (
              <p className="m-0" key="error-path">
                {error["path"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="features">Features:</label>
            <InputText id="features" className="w-full mb-3 p-inputtext-sm" value={_entity?.features} onChange={(e) => setValByKey("features", e.target.value)} required />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["features"]) ? (
              <p className="m-0" key="error-features">
                {error["features"]}
              </p>
            ) : null}
          </small>
        </div>*/}

                <div className="col-12 field">
                    {' '}
                    {/* Removed md:col-6 to make it full width */}
                    <span className="align-items-center">
                        <label htmlFor="content">Content:</label>
                        <Editor
                            id="content"
                            className="w-full mb-3"
                            value={_entity?.content}
                            onTextChange={(e) => setValByKey('content', e.htmlValue)} // Use htmlValue
                            // headerTemplate={renderHeader()} // Add the header toolbar
                            style={{ height: '320px' }} // Important: Set a height!
                            required
                        />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['content']) ? (
                            <p className="m-0" key="error-content">
                                {error['content']}
                            </p>
                        ) : null}
                    </small>
                </div>

                <div className="col-12 field">
                    <span className="align-items-center">
                        <label htmlFor="video">Video:</label>
                        <InputText id="video" className="w-full mb-3 p-inputtext-sm" value={_entity?.video} onChange={(e) => setValByKey('video', e.target.value)} required />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['video']) ? (
                            <p className="m-0" key="error-video">
                                {error['video']}
                            </p>
                        ) : null}
                    </small>
                </div>

                <small className="p-error">
                    {Array.isArray(Object.keys(error))
                        ? Object.keys(error).map((e, i) => (
                              <p className="m-0" key={i}>
                                  {e}: {error[e]}
                              </p>
                          ))
                        : error}
                </small>
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

export default connect(mapState, mapDispatch)(HelpSidebarContentsCreateDialogComponent);
