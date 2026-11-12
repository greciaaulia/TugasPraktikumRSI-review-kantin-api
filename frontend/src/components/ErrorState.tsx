interface Props {
  message: string;
  onRetry?: () => void;
}

// Tampilan error yang ramah untuk pengguna
export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="state-box error" role="alert">
      <span className="emoji">🫠</span>
      <h3>Waduh, ada yang error</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          Coba lagi
        </button>
      )}
    </div>
  );
}