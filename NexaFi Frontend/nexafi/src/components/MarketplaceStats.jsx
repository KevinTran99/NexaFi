import '../styles/marketplace-stats.css';

const MarketplaceStats = () => {
  return (
    <section className="marketplace-overview">
      <div className="market-pair-container">
        <div className="market-pair">EUA/USDT</div>
      </div>

      <div className="market-pair-stats-container">
        <div className="stat-item">
          <div className="stat-label">24h Change</div>
          <div className="stat-value negative">-1.39%</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">24h High</div>
          <div className="stat-value">$73.00</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">24h Low</div>
          <div className="stat-value">$72.00</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">24h Volume(EUA)</div>
          <div className="stat-value">1,234.00</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">24h Volume(USDT)</div>
          <div className="stat-value">89,123.40</div>
        </div>
      </div>
    </section>
  );
};

export default MarketplaceStats;
