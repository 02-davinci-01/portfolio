import Link from "next/link";
import type { ReactNode } from "react";

/** Sticky, blurred top bar shared by the landing + article pages. */
export default function ScriptaTopbar({
  crumb,
  folio,
}: {
  crumb: ReactNode;
  folio: string;
}) {
  return (
    <div className="topbar">
      <div className="wrap">
        <Link className="brand" href="/">
          02-davinci-01
        </Link>
        <div className="crumb">{crumb}</div>
        <div className="folio">{folio}</div>
      </div>
    </div>
  );
}
