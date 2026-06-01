const drops = Array.from({ length: 50 }, (_, i) => {
  const seed = i + 1;

  return {
    left: `${(seed * 37) % 100}%`,
    animationDelay: `${((seed * 17) % 50) / 10}s`,
    animationDuration: `${3 + ((seed * 13) % 30) / 10}s`,
  };
});

export default function Rain() {
  return (
    <div className="rain">
      {drops.map((style, i) => (
        <span key={i} className="drop" style={style} />
      ))}
    </div>
  );
}
