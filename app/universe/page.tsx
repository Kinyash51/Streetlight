export default function UniversePage() {
    return (
      <main className="universe-page">
        <section className="page-hero">
          <p className="section-tag">The World</p>
          <h1>The Streetlight Universe</h1>
          <p>
            A nameless city. Constant rain. Forgotten people. Hidden systems
            beneath the streets.
          </p>
        </section>
  
        <section className="lore-section">
          <div className="lore-block">
            <h2>The City</h2>
            <p>
              The city has no name because it does not need one. It remembers
              every person it breaks, every alley it swallows, and every
              streetlamp still burning through the rain.
            </p>
          </div>
  
          <div className="lore-block">
            <h2>The Underground</h2>
            <p>
              Beneath the streets, hidden networks move quietly. Some protect.
              Some hunt. Most people never notice them until it is too late.
            </p>
          </div>
  
          <div className="lore-block">
            <h2>The Forgotten</h2>
            <p>
              The forgotten are not weak. They are survivors living in the spaces
              the city pretends do not exist.
            </p>
          </div>
        </section>
      </main>
    );
  }