import "./scripta.css";
import ScriptaTransition from "../components/scripta/ScriptaTransition";

/**
 * Scripta route group. Wraps every page in `.scripta-page`, which scopes
 * the section's design tokens and restores native cursors (the main site
 * hides them for its custom cursor). Inherits Lenis smooth-scroll and the
 * font CSS variables from the root layout.
 *
 * `ScriptaTransition` sits just inside so each route change fades + rises in
 * rather than snapping.
 */
export default function ScriptaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="scripta-page">
      <ScriptaTransition>{children}</ScriptaTransition>
    </div>
  );
}
