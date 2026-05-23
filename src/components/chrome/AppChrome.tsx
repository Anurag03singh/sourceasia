"use client";

import { PageLoader } from "./PageLoader";
import { CustomCursor } from "./CustomCursor";
import { useLenisScroll } from "@/hooks/useLenisScroll";

export function AppChrome() {
  useLenisScroll();
  return (
    <>
      <PageLoader />
      <CustomCursor />
    </>
  );
}
