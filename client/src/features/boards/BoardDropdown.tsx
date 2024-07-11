import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  closeDialog,
  setBoardEditing,
  showDialog,
  showToast,
  toggleBoardDropdown,
} from '../ui/uiSlice';
import { RootState } from '../../app/store';
import { useEffect, useRef } from 'react';

import '../ui/Settings.css';
import { useDeleteBoardMutation } from '../api/apiSlice';

type Props = {
  id: string;
};
const BoardDropdown = ({ id }: Props) => {
  const showSettings = useSelector(
    (state: RootState) => state.ui.showBoardDropdown
  );
  const dialogConfirmed = useSelector(
    (state: RootState) => state.ui.dialogConfirmed
  );
  const dialog = useSelector((state: RootState) => state.ui.dialog);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [deleteBoard] = useDeleteBoardMutation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        event.target.className === 'board-dropdown-img' ||
        event.target.className === 'board-dropdown-btn'
      )
        return;
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        dispatch(toggleBoardDropdown());
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dispatch, showSettings]);

  useEffect(() => {
    const deleteRequest = async () => {
      try {
        await deleteBoard(dialog.id).unwrap();
        navigate('/');
      } catch (err) {
        console.log(err);
        dispatch(showToast({ msg: 'Failed to delete board', type: 'error' }));
      }
    };
    if (dialogConfirmed && dialog.initiator === 'board') {
      deleteRequest();
      dispatch(closeDialog());
    }
  }, [dialogConfirmed, dispatch, dialog, deleteBoard, navigate]);

  const showDeleteDialog = () => {
    if (showSettings) dispatch(toggleBoardDropdown());
    dispatch(
      showDialog({
        title: 'Delete board',
        description: 'Are you sure?',
        yes: 'Yes',
        no: 'Cancel',
        id,
        initiator: 'board',
      })
    );
  };

  const handleRename = () => {
    dispatch(setBoardEditing(true));
    dispatch(toggleBoardDropdown());
  };

  return (
    <div
      ref={dropdownRef}
      className={`board-dropdown settings-dropdown ${
        showSettings ? 'show' : 'hide'
      }`}
    >
      <div className="settings-section">
        <p className="settings-section-title">Board</p>
        <button className="settings-link" onClick={handleRename}>
          Rename
        </button>
        <button className="settings-link" onClick={showDeleteDialog}>
          Delete board
        </button>
      </div>
    </div>
  );
};

export default BoardDropdown;
