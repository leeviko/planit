import { useDispatch, useSelector } from 'react-redux';
import './Toast.css';
import { RootState } from '../../app/store';
import { useEffect, useState } from 'react';
import { hideToast } from './uiSlice';
const Toast = () => {
  const [visible, setVisible] = useState(false);
  const show = useSelector((state: RootState) => state.ui.showToast);
  const toast = useSelector((state: RootState) => state.ui.toast);
  const dispatch = useDispatch();

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          dispatch(hideToast());
        }, 200);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, dispatch]);

  return (
    <div className={`toast ${visible ? 'show' : 'hide'} ${toast.type}`}>
      <p>{toast.msg}</p>
    </div>
  );
};

export default Toast;
