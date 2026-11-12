// Kerangka tampilan saat data masih dimuat

export function StallGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className="stall-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li className="stall-card skeleton-card" key={i}>
          <div className="skeleton sk-cover" />
          <div className="card-body">
            <div className="skeleton sk-line w70" />
            <div className="skeleton sk-line w50" />
            <div className="skeleton sk-line w90" />
            <div className="skeleton sk-btn" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DetailSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="skeleton sk-head" />
      <div className="skeleton sk-block" />
      <div className="skeleton sk-block tall" />
    </div>
  );
}

export function RowsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="manage-list" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div className="skeleton sk-row" key={i} />
      ))}
    </div>
  );
}