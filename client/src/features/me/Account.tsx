import { useDispatch, useSelector } from 'react-redux';
import authRoute from '../auth/AuthRoute';
import { RootState } from '../../app/store';
import './Me.css';
import ProfilePicture from './ProfilePicture';
import { useDeleteUserMutation, useUpdateUserMutation } from '../api/apiSlice';
import { closeDialog, showDialog, showToast } from '../ui/uiSlice';
import { FormEvent, useEffect, useState } from 'react';
import { logoutUser, setUser } from '../auth/authSlice';
import { useNavigate } from 'react-router-dom';

const Account = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [username, setUsername] = useState('');
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const dispatch = useDispatch();
  const dialogConfirmed = useSelector(
    (state: RootState) => state.ui.dialogConfirmed
  );
  const dialog = useSelector((state: RootState) => state.ui.dialog);
  const navigate = useNavigate();

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (username === user.username) return;
    if (username.length < 3) return;

    try {
      const result = await updateUser({
        id: user.id,
        username,
      }).unwrap();

      setUsername('');
      dispatch(setUser(result));
      dispatch(showToast({ msg: 'Username updated', type: 'success' }));
    } catch (err) {
      console.log(err);
      dispatch(showToast({ msg: 'Failed to update username', type: 'error' }));
    }
  };

  useEffect(() => {
    const deleteRequest = async () => {
      try {
        await deleteUser(dialog.id).unwrap();
        dispatch(logoutUser());
        navigate('/');
      } catch (err) {
        console.log(err);
        dispatch(showToast({ msg: 'Failed to delete account', type: 'error' }));
      }
    };
    if (dialogConfirmed && dialog.initiator === 'user') {
      deleteRequest();
      dispatch(closeDialog());
      dispatch(showToast({ msg: 'Account deleted', type: 'success' }));
    }
  }, [dialogConfirmed, dispatch, dialog, deleteUser, navigate]);

  const showDeleteDialog = () => {
    if (!user) return;
    dispatch(
      showDialog({
        title: 'Delete account',
        description: 'This will also delete all your boards. Are you sure?',
        yes: 'Yes',
        no: 'Cancel',
        id: user.id,
        initiator: 'user',
      })
    );
  };

  return (
    <div className="account-page">
      <div className="account-page-content">
        <div className="account-details">
          {user && (
            <div className="pfp">
              <ProfilePicture username={user?.username} />
            </div>
          )}
          <div className="details">
            <p className="username">{user?.username}</p>
            <p className="email">{user?.email}</p>
          </div>
        </div>
        <div className="account-section about">
          <h3>About</h3>
          <form onSubmit={handleUpdate}>
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button className="btn">Save</button>
          </form>
        </div>
        <div className="account-section">
          <button className="delete-btn btn" onClick={showDeleteDialog}>
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
};

const WrappedPage = authRoute(Account);
export default WrappedPage;
