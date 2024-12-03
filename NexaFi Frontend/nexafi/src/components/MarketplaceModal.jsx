import '../styles/marketplace-modal.css';

const MarketplaceModal = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="marketplace-modal-overlay" onClick={onClose}>
      <div className="marketplace-modal-content" onClick={e => e.stopPropagation()}>
        <div className="marketplace-modal-header">
          <button className="marketplace-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="marketplace-modal-message-container">{message}</div>
      </div>
    </div>
  );
};

export default MarketplaceModal;
