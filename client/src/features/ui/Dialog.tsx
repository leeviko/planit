import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { closeDialog, confirmDialog } from './uiSlice';
import './Dialog.css';

const Dialog = () => {
  const showDialog = useSelector((state: RootState) => state.ui.showDialog);
  const { title, description, yes, no } = useSelector(
    (state: RootState) => state.ui.dialog
  );
  const dispatch = useDispatch();

  if (!showDialog) return null;

  const handleClose = () => {
    dispatch(closeDialog());
  };

  const handleConfirm = () => {
    dispatch(confirmDialog());
  };

  return (
    <>
      <div className="overlay" onClick={handleClose}></div>
      <div className="dialog">
        <div className="dialog-container">
          <h3 className="dialog-title">{title}</h3>
          <p className="dialog-desc">{description}</p>
          <div className="dialog-actions">
            <button
              className="btn dialog-btn yes-btn publish-btn"
              onClick={handleConfirm}
            >
              {yes}
            </button>
            <button
              className="btn dialog-btn no-btn delete-btn"
              onClick={handleClose}
            >
              {no}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dialog;
