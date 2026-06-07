"use client";

import { useState, useEffect } from "react";
import { type Operator, getClientSession } from "@/lib/session";

export function useOperator(): Operator | null {
  const [operator, setOperator] = useState<Operator | null>(null);

  useEffect(() => {
    setOperator(getClientSession());
  }, []);

  return operator;
}
