"use client";

import { usePathname } from "next/navigation";

/**
 * Replays a fade + rise entrance on every Scripta route change. Keying the
 * wrapper on the pathname forces React to remount it on navigation, which
 * restarts the CSS `scripta-page-in` animation — so arriving at the landing,
 * opening an article, and coming back all animate in instead of snapping.
 *
 * The animation uses `animation-fill-mode: backwards` (see scripta.css) so no
 * transform lingers once it finishes — sticky topbar and the fixed reading
 * progress bar keep working normally afterward.
 */
export default function ScriptaTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="scripta-enter">
      {children}
    </div>
  );
}
