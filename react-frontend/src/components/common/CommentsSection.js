import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import moment from 'moment';
import client from '../../services/restClient';
import Checkline from '../../assets/icons/Checkline';
import Trash from '../../assets/icons/Trash';
import Edit from '../../assets/icons/Edit';
import Checko from '../../assets/icons/Checko';
import { TabView, TabPanel } from 'primereact/tabview';

const CommentsSection = ({ recordId, user, alert, serviceName }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedCommentText, setEditedCommentText] = useState('');
    const [view, setView] = useState('commentsview');

    useEffect(() => {
        // Fetch company comments
        const fetchComments = async () => {
            try {
                const res = await client.service('comments').find({
                    query: {
                        recordId,
                        $populate: 'createdBy'
                    }
                });
                setComments(res.data || []);
            } catch (error) {
                console.debug({ error });
                alert({
                    title: 'Comments',
                    type: 'error',
                    message: error.message || 'Failed to get comments'
                });
            }
        };

        fetchComments();
    }, [recordId, alert]);

    const handleCancel = () => {
        setNewComment('');
        setShowCommentInput(false);
        setEditingCommentId(null);
    };

    const handleEditComment = (commentId, text) => {
        setEditingCommentId(commentId);
        setEditedCommentText(text);
    };

    const handleEditSubmit = async (commentId) => {
        if (editedCommentText.trim()) {
            try {
                await client.service('comments').patch(commentId, {
                    text: editedCommentText,
                    updatedBy: user._id
                });

                setComments(comments.map((comment) => (comment._id === commentId ? { ...comment, text: editedCommentText } : comment)));
                setEditingCommentId(null);
            } catch (error) {
                console.debug({ error });
                alert({
                    title: 'Edit Comment',
                    type: 'error',
                    message: error.message || 'Failed to edit comment'
                });
            }
        }
    };

    const NavItem = ({ label, isActive }) => (
        <div className={`flex flex-col items-center font-semibold ${isActive ? 'text-red-500' : 'text-slate-700'} w-[150px]`}>
            <span className="mb-2">{label}</span>
            <div className={`gap-2.5 self-stretch ${isActive ? 'bg-red-500' : 'bg-zinc-200'} h-[5px] w-[150px]`}></div>
        </div>
    );

    const handleCommentSubmit = async () => {
        if (newComment.trim()) {
            try {
                const comment = await client.service('comments').create({
                    text: newComment,
                    recordId,
                    createdBy: user._id,
                    updatedBy: user._id,
                    resolved: false
                });

                const newCommentWithUser = {
                    ...comment,
                    createdBy: {
                        _id: user._id,
                        name: user.email
                    }
                };

                setComments([...comments, newCommentWithUser]);
                setNewComment('');
                setShowCommentInput(false);
            } catch (error) {
                console.debug({ error });
                alert({
                    title: 'Comment',
                    type: 'error',
                    message: error.message || 'Failed to add comment'
                });
            }
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await client.service('comments').remove(commentId);
            setComments(comments.filter((comment) => comment._id !== commentId));
            alert({
                title: 'Comment',
                type: 'success',
                message: 'Comment deleted successfully!'
            });
        } catch (error) {
            console.debug({ error });
            alert({
                title: 'Comment',
                type: 'error',
                message: error.message || 'Failed to delete comment'
            });
        }
    };

    const handleToggleResolve = async (commentId) => {
        try {
            const updatedComments = comments.map((comment) => {
                if (comment._id === commentId) {
                    const updatedComment = {
                        ...comment,
                        resolved: !comment.resolved
                    };
                    client.service('comments').patch(commentId, { resolved: updatedComment.resolved });

                    if (!comment.resolved) {
                        alert({
                            title: 'Comment',
                            type: 'success',
                            message: 'Successfully resolved comment.'
                        });
                    }

                    return updatedComment;
                }
                return comment;
            });
            setComments(updatedComments);
        } catch (error) {
            console.debug({ error });
            alert({
                title: 'Comment',
                type: 'error',
                message: error.message || 'Failed to update comment'
            });
        }
    };

    return (
        <>
            <div className="w-full">
                <div className=" mt-10 ml-3">
                    <TabView style={{ '--tabview-header-line-height': '13rem' }}>
                        <TabPanel header="Comments">
                            <div className="comment-section">
                                {comments.filter((comment) => !comment.resolved).length > 0
                                    ? comments
                                          .filter((comment) => !comment.resolved)
                                          .map((comment) => (
                                              <div key={comment._id} className="card w-full">
                                                  <div className="flex justify-between items-center mb-2">
                                                      <div className="flex items-center">
                                                          <strong>{comment.createdBy.name}</strong>
                                                          <small className="ml-2 text-secondary text-xs" style={{ color: '#6A7178' }}>
                                                              {moment(comment.createdAt).format('DD MMM YY, h:mm A')}
                                                          </small>
                                                      </div>
                                                      <div className="flex items-center space-x-3">
                                                          {comment.createdBy._id === user._id && (
                                                              <>
                                                                  <Edit onClick={() => handleEditComment(comment._id, comment.text)} className="cursor-pointer" title="Edit comment" />
                                                                  <Trash onClick={() => handleDeleteComment(comment._id)} className="cursor-pointer" title="Delete comment" />
                                                              </>
                                                          )}
                                                          {comment.resolved ? <Checko onClick={() => handleToggleResolve(comment._id)} className="text-green-600 cursor-pointer" /> : <Checkline onClick={() => handleToggleResolve(comment._id)} className="cursor-pointer" />}
                                                      </div>
                                                  </div>
                                                  <div className="mb-2">
                                                      {editingCommentId === comment._id ? (
                                                          <div className="flex items-center">
                                                              <InputText value={editedCommentText} onChange={(e) => setEditedCommentText(e.target.value)} className="w-full p-inputtext-lg text-sm" />
                                                              <div
                                                                  style={{
                                                                      display: 'flex',
                                                                      alignItems: 'center',
                                                                      justifyContent: 'center'
                                                                  }}
                                                              >
                                                                  <Button
                                                                      label="Save"
                                                                      onClick={() => handleEditSubmit(comment._id)}
                                                                      disabled={!editedCommentText.trim()}
                                                                      className="p-button-rounded p-button-primary ml-2"
                                                                      style={{
                                                                          height: '30px'
                                                                      }}
                                                                  />
                                                                  <Button
                                                                      label="Cancel"
                                                                      onClick={handleCancel}
                                                                      className="p-button-rounded p-button-secondary ml-2"
                                                                      style={{
                                                                          color: '#D30000',
                                                                          borderColor: '#D30000',
                                                                          backgroundColor: 'white',
                                                                          height: '30px'
                                                                      }}
                                                                  />
                                                              </div>
                                                          </div>
                                                      ) : (
                                                          <p className="text-sm">{comment.text}</p>
                                                      )}
                                                  </div>
                                              </div>
                                          ))
                                    : !showCommentInput && (
                                          <div className="flex flex-col items-center mb-2">
                                              <p className="text-muted text-center">Give feedback or start discussion.</p>
                                              <Button label="Add comment" onClick={() => setShowCommentInput(true)} className="mt-3 p-button-rounded p-button-primary" />
                                          </div>
                                      )}
                            </div>
                        </TabPanel>
                        <TabPanel header="Resolved">
                            <div className="comment-section">
                                {comments.filter((comment) => comment.resolved).length > 0 &&
                                    comments
                                        .filter((comment) => comment.resolved)
                                        .map((comment) => (
                                            <div key={comment._id} className="card w-full">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="flex items-center">
                                                        <strong>{comment.createdBy.name}</strong>
                                                        <small className="ml-2 text-secondary text-xs" style={{ color: '#6A7178' }}>
                                                            {moment(comment.createdAt).format('DD MMM YY, h:mm A')}
                                                        </small>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        {comment.createdBy._id === user._id && (
                                                            <>
                                                                <Edit onClick={() => handleEditComment(comment._id, comment.text)} className="cursor-pointer" title="Edit comment" />
                                                                <Trash onClick={() => handleDeleteComment(comment._id)} className="cursor-pointer" title="Delete comment" />
                                                            </>
                                                        )}
                                                        {comment.resolved ? <Checko onClick={() => handleToggleResolve(comment._id)} className="text-green-600 cursor-pointer" /> : <Checkline onClick={() => handleToggleResolve(comment._id)} className="cursor-pointer" />}
                                                    </div>
                                                </div>
                                                <div className="mb-2">
                                                    {editingCommentId === comment._id ? (
                                                        <div className="flex items-center">
                                                            <InputText value={editedCommentText} onChange={(e) => setEditedCommentText(e.target.value)} className="w-full p-inputtext-lg text-sm" />
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                            >
                                                                <Button
                                                                    label="Save"
                                                                    onClick={() => handleEditSubmit(comment._id)}
                                                                    disabled={!editedCommentText.trim()}
                                                                    className="p-button-rounded p-button-primary ml-2"
                                                                    style={{
                                                                        height: '30px'
                                                                    }}
                                                                />
                                                                <Button
                                                                    label="Cancel"
                                                                    onClick={handleCancel}
                                                                    className="p-button-rounded p-button-secondary ml-2"
                                                                    style={{
                                                                        color: '#D30000',
                                                                        borderColor: '#D30000',
                                                                        backgroundColor: 'white',
                                                                        height: '30px'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm">{comment.text}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                            </div>
                        </TabPanel>
                    </TabView>
                </div>

                {showCommentInput && (
                    <div className="card w-full">
                        <div className="flex items-center mb-2">
                            <strong>{user.name}</strong>
                            <small className="text-secondary text-xs ml-2" style={{ color: '#6A7178' }}>
                                {moment().format('DD MMM YY, h:mm A')}
                            </small>
                        </div>
                        <div className="flex items-center mt-3">
                            <InputText value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="w-full p-inputtext-lg text-sm" />
                        </div>
                        <div className="flex mt-3">
                            <Button
                                label="Cancel"
                                onClick={handleCancel}
                                className="p-button-rounded p-button-secondary"
                                style={{
                                    backgroundColor: 'white',
                                    color: '#D30000',
                                    border: '2px solid #D30000',
                                    height: '30px'
                                }}
                            />
                            <Button label="Submit" onClick={handleCommentSubmit} className="ml-2 p-button-rounded p-button-primary" disabled={!newComment.trim()} style={{ height: '30px' }} />
                        </div>
                    </div>
                )}

                {comments.length > 0 ? (
                    <div className="comment-input-section  surface-border px-3 mb-5">
                        <div className="flex align-items-center">
                            <div className="w-full">
                                <InputText value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="w-full p-inputtext-lg" style={{ fontSize: '12px' }} />
                            </div>

                            <Button label="Submit" onClick={handleCommentSubmit} className="ml-3 p-button-rounded p-button-primary" disabled={!newComment.trim()} />
                        </div>
                    </div>
                ) : (
                    ''
                )}
            </div>
        </>
    );
};

export default CommentsSection;
