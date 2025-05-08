const DirectionIcon = ({
    direction,
    className,
  }: {
    direction: "auto" | "ltr" | "rtl";
    className?: string;
  }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      {direction === "auto" && (
        <path d="m21,18l-4,-4l0,3l-10.62434,0.00474l0,-3.20844l-3.92008,3.98258l3.79215,4.10736l0.0458,-2.8357l10.70647,-0.05054l0,3m-8,-7l2,0l0,-11l2,0l0,11l2,0l0,-11l2,0l0,-2l-8,0a4,4 0 0 0 -4,4a4,4 0 0 0 4,4" />
      )}
      {direction === "ltr" && (
        <path d="M21 18l-4-4v3H5v2h12v3l4-4M9 4v11h2V4h2v11h2V4h2V2H9a4 4 0 0 0 0 8" />
      )}
      {direction === "rtl" && (
        <path d="M8 17v-3l-4 4 4 4v-3h12v-2M10 4v11h2V4h2v11h2V4h2V2h-8a4 4 0 0 0 0 8" />
      )}
    </svg>
  );
  
  export default DirectionIcon;
  