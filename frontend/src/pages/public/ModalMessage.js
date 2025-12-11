import React from "react";
import "../../css/modalMessage.css"; // Import your CSS styles for the modal

const typeTitles = {
    info: "Bilgi Mesajı",
    warning: "Uyarı",
    error: "Hata",
    success: "Başarılı"
};

const ModalMessage = ({ open, type = "info", message, onConfirm, onCancel }) => {
    if (!open) return null;

    return (
        <div className={`modal-message-overlay modal-bg-${type}`}>
            <div className={`modal-message modal-${type}`}>
                <div className="modal-message-header">
                    <span className="modal-message-title">{typeTitles[type] || "Mesaj"}</span>
                </div>
                <div className="modal-message-content">{message}</div>
                <div className="modal-message-actions">
                    <button className="submit-button" onClick={onConfirm}>Evet</button>
                    <button className="cancel-button" onClick={onCancel}>İptal</button>
                </div>
            </div>
        </div>
    );
};

export default ModalMessage;