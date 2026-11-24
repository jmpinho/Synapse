// Peças visuais pequenas, reutilizadas em várias seções da landing.

// Mesmo logo da Sidebar do app: "S" + "y" em destaque + "napse" + estrela.
export function Logo() {
  return (
    <span className="landing__logo">
      S<span className="landing__logo-y">y</span>napse
      <img
        className="landing__logo-estrela"
        src="/shooting-star.png"
        alt=""
        width="28"
        height="28"
      />
    </span>
  );
}

export function IconeSeta() {
  return (
    <svg
      className="landing__botao-seta"
      viewBox="0 0 34 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0 6h32M27 1l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
