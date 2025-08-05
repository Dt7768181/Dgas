import type { SVGProps } from "react";

export function GasCylinderIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 21h10" />
      <path d="M8 3h8" />
      <path d="M11.5 3a1.5 1.5 0 0 1-3 0" />
      <path d="M12 3v1" />
      <path d="M17.8 4.2C19.2 5.6 20 7.7 20 10v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7c0-2.3.8-4.4 2.2-5.8" />
      <path d="M12 10h.01" />
    </svg>
  );
}
