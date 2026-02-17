import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          ar?: boolean;
          "ar-modes"?: string;
          "camera-controls"?: boolean;
          "auto-rotate"?: boolean;
          "auto-rotate-delay"?: number | string;
          "rotation-per-second"?: string;
          "interaction-prompt"?: string;
          "camera-orbit"?: string;
          "camera-target"?: string;
          "field-of-view"?: string;
          "min-camera-orbit"?: string;
          "max-camera-orbit"?: string;
          "interpolation-decay"?: string;
          exposure?: string;
          "shadow-intensity"?: string;
          "shadow-softness"?: string;
          "environment-image"?: string;
          "skybox-image"?: string;
          poster?: string;
          loading?: "auto" | "lazy" | "eager";
          reveal?: "auto" | "manual";
          "tone-mapping"?: string;
          "disable-zoom"?: boolean;
          "disable-pan"?: boolean;
          "touch-action"?: string;
          autoplay?: boolean;
          "animation-name"?: string;
          orientation?: string;
          scale?: string;
        },
        HTMLElement
      >;
    }
  }
}
