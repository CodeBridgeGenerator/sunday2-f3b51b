import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import DeleteIcon from '../../assets/media/Delete.png';

const AreYouSureDialog = (props) => {
    const renderFooter = () => (
        <div className="flex justify-content-center" style={{ padding: '1rem' }}>
            <Button
                label="Cancel"
                onClick={props.onHide}
                rounded
                className="p-button-rounded p-button-secondary ml-2"
                style={{
                    color: '#D30000',
                    borderColor: '#D30000',
                    backgroundColor: 'white',
                    width: '200px',
                    marginRight: '1rem'
                }}
            />
            <Button label="Delete" onClick={props.onYes} className="no-focus-effect" rounded style={{ width: '200px' }} />
        </div>
    );

    return (
        <Dialog
            header={props.header}
            visible={props.show}
            closable={false}
            onHide={props.onHide}
            modal
            // style={{ width: "40vw" }}
            className="min-w-max"
            footer={renderFooter()}
            // resizable={false}
        >
            <div className="flex flex-column align-items-center">
                <img src={DeleteIcon} alt="Delete" style={{ width: '150px', height: '150px', marginBottom: '1rem' }} />
                <p className="m-0" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                    Delete listing?
                </p>
                <p className="m-0" style={{ textAlign: 'center' }}>
                    This action cannot be undone, and all data will be deleted permanently.
                </p>
            </div>
        </Dialog>
    );
};

export default AreYouSureDialog;
