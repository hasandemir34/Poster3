"use client";

import { useEffect } from "react";

export function PaytrFrame({ token }: { token: string }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.paytr.com/js/iframeResizer.min.js";
    script.onload = () => {
      // @ts-expect-error paytr global
      if (typeof iFrameResize !== "undefined") iFrameResize({}, "#paytriframe");
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  return (
    <iframe
      id="paytriframe"
      src={`https://www.paytr.com/odeme/guvenli/${token}`}
      frameBorder="0"
      scrolling="no"
      style={{ width: "100%" }}
    />
  );
}
