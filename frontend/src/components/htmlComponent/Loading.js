import React from "react";
import "../../css/loading.css";

const Loading = ({message}) => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>{message || 'Yükleniyor...'}</p>
    </div>
  );
};

export default Loading;
