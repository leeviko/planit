import './LoaderInline.css';

const LoaderInline = () => {
  return (
    <div className="inline-loader-container">
      <div className="inline-loader">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <span>_</span>
    </div>
  );
};

export default LoaderInline;
