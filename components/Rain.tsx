export default function Rain() {
    return (
      <div className="rain">
        {Array.from({ length: 50 }).map((_, i) => (
          <span
            key={i}
            className="drop"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    );
  }