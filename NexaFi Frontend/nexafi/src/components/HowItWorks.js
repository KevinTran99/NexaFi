import React from 'react';
import '../styles/howItWorks.css';

const HowItWorks = () => {
  return (
    <section id="howItWorks" className="howItWorks-section">
      <div className="howItWorks-content">
        <header className="howItWorks-header">
          <h1>How It Works</h1>
        </header>

        <main>
          <section className="howItWorks-step">
            <img src="/placeholder.jpg" alt="Water drops on a green leaf" />
            <div className="howItWorks-description">
              <h2>Access the Marketplace</h2>
              <p>
                Users can visit our platform without any registration. Simply connect your digital wallet to access our
                marketplace.
              </p>
            </div>
          </section>

          <section className="howItWorks-step reverse">
            <img src="/placeholder.jpg" alt="Water drops on a green leaf" />
            <div className="howItWorks-description">
              <h2>Explore and Purchase NFTs</h2>
              <p>
                Browse our selection of NFTs representing various environmental credits, including EUAs, EUAAs, and
                more. Users can start buying, selling, and trading these NFTs directly from our marketplace.
              </p>
            </div>
          </section>

          <section className="howItWorks-step">
            <img src="/placeholder.jpg" alt="Water drops on a green leaf" />
            <div className="howItWorks-description">
              <h2>Transfer Your Environmental Credits</h2>
              <p>
                For those interested in minting NFTs, they can apply for registration on our platform. Upon successful
                registration, users can then transfer their environmental credits from their registry accounts to our
                system. This step is necessary only for those looking to create new NFTs based on their holdings.
              </p>
            </div>
          </section>

          <section className="howItWorks-step reverse">
            <img src="/placeholder.jpg" alt="Water drops on a green leaf" />
            <div className="howItWorks-description">
              <h2>Mint Your NFTs</h2>
              <p>
                Once the transfer is complete, users will receive a mint allowance, allowing them to mint an equal
                number of NFTs representing the environmental credits sent to us. This step is optional and only
                required for users who wish to create NFTs.
              </p>
            </div>
          </section>

          <section className="howItWorks-step">
            <img src="/placeholder.jpg" alt="Water drops on a green leaf" />
            <div className="howItWorks-description">
              <h2>Burn Your NFTs</h2>
              <p>
                Registered users can choose to burn their NFTs and request the equivalent amount of real environmental
                credits (such as EUAs or EUAAs) to be transferred back into their union registry accounts. This provides
                a seamless way to convert digital assets into tangible environmental credits.
              </p>
            </div>
          </section>

          <section className="howItWorks-step reverse">
            <img src="/placeholder.jpg" alt="Water drops on a green leaf" />
            <div className="howItWorks-description">
              <h2>Contribute to Sustainability</h2>
              <p>
                Any user can burn their NFTs and request the retirement of an equivalent amount of environmental
                credits, actively contributing to carbon emission reduction. By participating in this process,
                individuals not only help mitigate their carbon footprint but also support global efforts toward a
                sustainable future.
              </p>
            </div>
          </section>
        </main>
      </div>
    </section>
  );
};

export default HowItWorks;
