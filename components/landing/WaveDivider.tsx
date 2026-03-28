const WaveDivider = ({ flip = false, className = "" }: {
    flip?: boolean;
    className?: string;
}) => (<div className={`w-full overflow-hidden leading-[0] ${flip ? "rotate-180" : ""} ${className}`}>
      <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
        <path d="M0 60L48 54C96 48 192 36 288 42C384 48 480 72 576 78C672 84 768 72 864 60C960 48 1056 36 1152 42C1248 48 1344 72 1392 84L1440 96V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V60Z" className="fill-background"/>
      </svg>
    </div>);
export default WaveDivider;
