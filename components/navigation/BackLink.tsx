"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

type BackLinkProps = {
  href: string;
  label: string;
  className?: string;
};

export function BackLink({ href, label, className = "" }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 text-sm font-medium text-pln-primary hover:text-pln-dark transition-colors ${className}`}
    >
      <ArrowLeftIcon className="h-4 w-4" />
      {label}
    </Link>
  );
}
