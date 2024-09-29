import React from 'react';
import '../styles/benefits.css';

const Benefits = () => {
  return (
    <section id="benefits" className="benefits-section">
      <section className="benefits-content">
        <header className="benefits-header">
          <h2>Benefits of NexaFi</h2>
        </header>

        <section className="benefits-list">
          <article className="benefits-item benefits-item-bordered">
            <img src="/earth-icon.png" alt="icon of a globe representing environmental markets" />
            <h3 className="benefits-title">Access to Environmental Markets</h3>
            <p className="benefits-description">
              Easily trade environmental credits like EUAs and EUAAs without the need for complex exchanges or high
              fees. Connect your cryptocurrency wallet and start participating immediately.
            </p>
          </article>

          <article className="benefits-item benefits-item-bordered">
            <img
              src="/inclusivity-icon.png"
              alt="icon of four hands holding each other representing inclusivity in environmental trading"
            />
            <h3 className="benefits-title">Democratized Participation</h3>
            <p className="benefits-description">
              Our platform allows anyone, companies and individuals alike to engage in environmental credit trading,
              making sustainability accessible to all.
            </p>
          </article>

          <article className="benefits-item">
            <img src="/nft-icon.png" alt="icon representing NFTs for environmental credits" />
            <h3 className="benefits-title">Minting NFTs from Environmental Credits</h3>
            <p className="benefits-description">
              Transfer your environmental credits like EUAs or EUAAs from your Union Registry account to our platform,
              receiving a mint allowance to create tradable NFTs that represent your credits.
            </p>
          </article>

          <article className="benefits-item benefits-item-bordered">
            <img src="/security-icon.png" alt="icon symbolizing security in blockchain transactions" />
            <h3 className="benefits-title">Secure & Transparent</h3>
            <p className="benefits-description">
              Blockchain technology ensures secure, transparent transactions for minting, trading, and retiring NFTs,
              giving you confidence in every action you take.
            </p>
          </article>

          <article className="benefits-item benefits-item-bordered">
            <img src="/leaf-icon.png" alt="icon of a green leaf symbolizing sustainability efforts" />
            <h3 className="benefits-title">Contribute to Sustainability Efforts</h3>
            <p className="benefits-description">
              By burning NFTs, users can effortlessly and voluntarily retire environmental credits like EUAs,
              simplifying the voluntary retirement process. This innovation allows anyone to engage in environmental
              stewardship without the complexities of traditional methods.
            </p>
          </article>

          <article className="benefits-item">
            <img src="/cash-icon.png" alt="icon of money bills representing low fees for transactions" />
            <h3 className="benefits-title">Low Fees & Easy Transactions</h3>
            <p className="benefits-description">
              Enjoy a streamlined process with minimal fees, allowing you to trade or retire environmental credits
              efficiently.
            </p>
          </article>
        </section>
      </section>
    </section>
  );
};

export default Benefits;
