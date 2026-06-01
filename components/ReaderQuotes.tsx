export default function ReaderQuotes() {
    const quotes = [
      {
        text: "Streetlight feels like a city that's alive.",
        author: "Early Reader",
      },
      {
        text: "Dark, beautiful, and haunting.",
        author: "Beta Reader",
      },
      {
        text: "I kept thinking about the characters long after reading.",
        author: "Community Member",
      },
    ];
  
    return (
      <section className="quotes-section">
        <div className="section-head">
          <p className="section-tag">Reader Reactions</p>
          <h2>What readers are saying</h2>
        </div>
  
        <div className="quotes-grid">
          {quotes.map((quote, index) => (
            <div className="quote-card" key={index}>
              <div className="stars">★★★★★</div>
  
              <p>&quot;{quote.text}&quot;</p>
  
              <span>— {quote.author}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }
