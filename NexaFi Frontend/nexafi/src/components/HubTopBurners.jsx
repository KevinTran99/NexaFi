import '../styles/hub-top-burners.css';

const HubTopBurners = () => {
  const topBurners = [
    { id: 1, name: 'Green Corp', burnedAmount: 15000, avatar: '/green-corp.jpg' },
    { id: 2, name: 'Liam Woods', burnedAmount: 12000, avatar: '/liam-woods.jpg' },
    { id: 3, name: 'Sophie Rivers', burnedAmount: 9500, avatar: '/sophie-rivers.jpg' },
    { id: 4, name: 'CarbonNeutral', burnedAmount: 8000, avatar: '/carbon-neutral.jpg' },
    { id: 5, name: 'CleanEnergy', burnedAmount: 7800, avatar: '/clean-energy.jpg' },
    { id: 6, name: 'Eco Warriors', burnedAmount: 7000, avatar: '/eco-warriors.jpg' },
    { id: 7, name: 'Blue Planet', burnedAmount: 6400, avatar: '/blue-planet.jpg' },
    { id: 8, name: 'James Lake', burnedAmount: 6000, avatar: '/james-lake.jpg' },
    { id: 9, name: 'GreenTech', burnedAmount: 5000, avatar: '/green-tech.jpg' },
    { id: 10, name: 'Emma Greenfield', burnedAmount: 4200, avatar: '/emma-greenfield.jpg' },
    { id: 11, name: 'SustainableFuture', burnedAmount: 4000, avatar: '/sustainable-future.jpg' },
    { id: 12, name: 'EcoTech', burnedAmount: 2800, avatar: '/eco-tech.jpg' },
  ];

  return (
    <div className="top-burners-section">
      <h2 className="top-burners-title">Top Carbon Neutralizers</h2>
      <div className="top-burners-grid">
        {topBurners.map(burner => (
          <div key={burner.id} className="top-burners-item">
            <img src={burner.avatar} alt={burner.name} className="top-burners-avatar" />
            <h3 className="top-burners-name">{burner.name}</h3>
            <p className="top-burners-description">{burner.burnedAmount} tons CO₂ neutralized</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HubTopBurners;
