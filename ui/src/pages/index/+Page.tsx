"use client";

import { useEffect } from "react";
import { navigate } from "vike/client/router";

export { Page };

function Page() {
  useEffect(() => {
    navigate("/dashboard");
  }, []);

  return null;
}
