const ShowDirectionArrowIcon = ({ showArrow = true, className }: { showArrow?: boolean; className?: string; }) => (
  <svg xmlns="http://www.w3.org/2000/svg"
    width="21"
    height="21"
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
  >
    <g>
    <text x="12.6" y="14.5" textAnchor="middle" fontSize="17.5" fontWeight="bold">Ω</text>
      {showArrow && (
        <text x="12.6" y="24" textAnchor="middle" fontSize="17" fontWeight="bold">↔</text>
      )}
    </g>
  </svg>
);

export default ShowDirectionArrowIcon;
