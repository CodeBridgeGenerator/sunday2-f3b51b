import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { classNames } from 'primereact/utils';
import { Galleria } from 'primereact/galleria';
import client from '../../../services/restClient';

const AssetsPage = (props) => {
    const [images, setImages] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHelpSidebarVisible, setHelpSidebarVisible] = useState(false);
    const helpSidebarRef = useRef(null);
    const galleriaRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (helpSidebarRef.current && !helpSidebarRef.current.contains(event.target) && isHelpSidebarVisible) {
                setHelpSidebarVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isHelpSidebarVisible]);

    const toggleHelpSidebar = () => {
        setHelpSidebarVisible(!isHelpSidebarVisible);
    };

    const allowedExtensions = ['png', 'jpeg', 'jpg'];

    // useEffect(() => {
    //   //on mount
    //   setLoading(true);
    //   client
    //     .service("documentStorages")
    //     .find({
    //       query: {
    //         $limit: 10000,
    //         $populate: [
    //           {
    //             path: "createdBy",
    //             service: "users",
    //             select: ["name"],
    //           },
    //           {
    //             path: "updatedBy",
    //             service: "users",
    //             select: ["name"],
    //           },
    //         ],
    //       },
    //     })
    //     .then((res) => {
    //       let results = res.data;
    //       const filteredResults = results.filter((item) => {
    //         if (item.url) {
    //           const url = item.url.toLowerCase();
    //           const extension = url.split(".").pop();
    //           return allowedExtensions.includes(extension);
    //         }
    //         return false;
    //       });

    //       setData(filteredResults);
    //       setLoading(false);
    //     })
    //     .catch((error) => {
    //       console.debug({ error });
    //       setLoading(false);
    //       props.alert({
    //         title: "Media Storages",
    //         type: "error",
    //         message: error.message || "Failed get Media Storages",
    //       });
    //     });
    // }, []);
    useEffect(() => {
        const fetchImages = async () => {
            props.show();
            try {
                const res = await client.service('documentStorages').find({
                    query: {
                        $limit: 10000
                    }
                });
                let results = res.data;
                const filteredResults = results.filter((item) => {
                    if (item.url) {
                        const url = item.url.toLowerCase();
                        const extension = url.split('.').pop();
                        return allowedExtensions.includes(extension);
                    }
                    return false;
                });
                const imageData = filteredResults.map((doc) => ({
                    itemImageSrc: doc.url,
                    thumbnailImageSrc: doc.url,
                    alt: doc.name || 'Asset Image',
                    title: doc.name || 'Asset Image',
                    tableName: doc.tableName
                }));
                console.log('imageData', imageData);
                setImages(imageData);
            } catch (error) {
                console.error('Error fetching images:', error);
                props.alert({
                    title: 'Assets',
                    type: 'error',
                    message: error.message || 'Failed to fetch images'
                });
            } finally {
                props.hide();
            }
        };

        fetchImages();
    }, []);

    const itemTemplate = (item) => {
        return (
            <div
                style={{
                    width: '100%',
                    height: '500px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <img
                    src={item.itemImageSrc}
                    alt={item.alt}
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        objectFit: 'contain'
                    }}
                />
            </div>
        );
    };

    const thumbnailTemplate = (item) => {
        return (
            <img
                src={item.thumbnailImageSrc}
                alt={item.alt}
                style={{
                    cursor: 'pointer',
                    width: '100%',
                    height: '80px',
                    objectFit: 'cover',
                    display: 'block'
                }}
            />
        );
    };
    const caption = (item) => {
        return (
            <>
                <div className="text-xl mb-2 font-bold">{item.title}</div>
                <p className="text-white">{item.tableName}</p>
            </>
        );
    };
    return (
        <div className="mt-5">
            <div className="grid">
                <div className="col-6 flex align-items-center justify-content-start">
                    <h4 className="mb-0 ml-2">
                        <span> DATA / </span>
                        <strong>Assets </strong>
                    </h4>
                </div>
                <div className="col-6 flex justify-content-end"></div>
            </div>

            <div className="grid align-items-center">
                <div className="col-12">
                    <div className="grid" style={{ margin: 'auto' }}>
                        {images &&
                            images.map((image, index) => {
                                return (
                                    <div className="col-2" key={index}>
                                        <div
                                            className="thumbnail-container"
                                            style={{
                                                position: 'relative',
                                                width: '100%',
                                                height: '120px',
                                                overflow: 'hidden',
                                                marginBottom: '10px'
                                            }}
                                        >
                                            <img
                                                src={image.thumbnailImageSrc}
                                                alt={image.alt}
                                                style={{
                                                    cursor: 'pointer',
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    display: 'block'
                                                }}
                                                onClick={() => {
                                                    setActiveIndex(index);
                                                    galleriaRef.current.show();
                                                }}
                                            />
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '0',
                                                    left: '0',
                                                    width: '100%',
                                                    background: 'rgba(0, 0, 0, 0.5)',
                                                    color: '#fff',
                                                    padding: '0.5rem',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {image.title}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                    <Galleria
                        ref={galleriaRef}
                        value={images}
                        activeIndex={activeIndex}
                        onItemChange={(e) => setActiveIndex(e.index)}
                        numVisible={5}
                        style={{ maxWidth: '800px', margin: 'auto' }}
                        showItemNavigators
                        thumbnail={thumbnailTemplate}
                        item={itemTemplate}
                        circular
                        autoPlay
                        transitionInterval={3000}
                        caption={caption}
                        fullScreen
                    />
                </div>
            </div>

            <div
                ref={helpSidebarRef}
                id="rightsidebar"
                className={classNames('overlay-auto z-10 surface-overlay shadow-2 fixed top-0 right-0 w-20rem animation-duration-150 animation-ease-in-out', { hidden: !isHelpSidebarVisible, block: isHelpSidebarVisible })}
                style={{
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                }}
            >
                <div className="flex flex-column h-full p-4 bg-white" style={{ height: 'calc(100% - 60px)', marginTop: '60px' }}>
                    <span className="text-xl font-medium text-900 mb-3">Help bar</span>
                    <div className="border-2 border-dashed surface-border border-round surface-section flex-auto"></div>
                </div>
            </div>
        </div>
    );
};

const mapState = (state) => {
    const { user, isLoggedIn } = state.auth;
    return { user, isLoggedIn };
};

const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
    show: () => dispatch.loading.show(),
    hide: () => dispatch.loading.hide()
});

export default connect(mapState, mapDispatch)(AssetsPage);
