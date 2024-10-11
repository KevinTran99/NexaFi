import React from 'react';
import '../styles/how-it-works.css';

const HowItWorks = () => {
  return (
    <section id="howItWorks" className="howItWorks-section">
      <div className="howItWorks-content">
        <header className="howItWorks-header">
          <h2>How It Works</h2>
        </header>

        <section className="howItWorks-steps">
          <section className="howItWorks-step">
            <img src="/placeholder.jpg" alt="Water drops on a green leaf" />
            <article className="howItWorks-description">
              <h3>Access the Marketplace</h3>
              <p>
                Users can visit our platform without any registration. Simply connect your digital wallet to access our
                marketplace.
              </p>
            </article>
          </section>

          <section className="howItWorks-step reverse">
            <img src="/placeholder.jpg" alt="Water drops on a green leaf" />
            <article className="howItWorks-description">
              <h3>Explore and Purchase NFTs</h3>
              <p>
                Browse our selection of NFTs representing various environmental credits, including EUAs, EUAAs, and
                more. Users can start buying, selling, and trading these NFTs directly from our marketplace.
              </p>
            </article>
          </section>

          <section className="howItWorks-step">
            <img src="/placeholder.jpg" alt="Water drops on a green leaf" />
            <article className="howItWorks-description">
              <h3>Transfer Your Environmental Credits</h3>
              <p>
                For those interested in minting NFTs, they can apply for registration on our platform. Upon successful
                registration, users can then transfer their environmental credits from their registry accounts to our
                system. This step is necessary only for those looking to create new NFTs based on their holdings.
              </p>
            </article>
          </section>

          <section className="howItWorks-step reverse">
            <img src="/placeholder.jpg" alt="Water drops on a green leaf" />
            <article className="howItWorks-description">
              <h3>Mint Your NFTs</h3>
              <p>
                Once the transfer is complete, users will receive a mint allowance, allowing them to mint an equal
                number of NFTs representing the environmental credits sent to us. This step is optional and only
                required for users who wish to create NFTs.
              </p>
            </article>
          </section>

          <section className="howItWorks-step">
            <img src="/placeholder.jpg" alt="Water drops on a green leaf" />
            <article className="howItWorks-description">
              <h3>Burn Your NFTs</h3>
              <p>
                Registered users can choose to burn their NFTs and request the equivalent amount of real environmental
                credits (such as EUAs or EUAAs) to be transferred back into their union registry accounts. This provides
                a seamless way to convert digital assets into tangible environmental credits.
              </p>
            </article>
          </section>

          <section className="howItWorks-step reverse">
            <img src="/placeholder.jpg" alt="Water drops on a green leaf" />
            <article className="howItWorks-description">
              <h3>Contribute to Sustainability</h3>
              <p>
                Any user can burn their NFTs and request the retirement of an equivalent amount of environmental
                credits, actively contributing to carbon emission reduction. By participating in this process,
                individuals not only help mitigate their carbon footprint but also support global efforts toward a
                sustainable future.
              </p>
            </article>
          </section>
        </section>
      </div>
    </section>
  );
};

export default HowItWorks;
