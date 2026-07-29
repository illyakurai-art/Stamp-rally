import { Suspense } from "react";
import { ScanResultClient } from "@/components/scan-result-client";

export default function ScanResultPage({
  searchParams,
}: {
  searchParams: Promise<{ artist?: string; error?: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ScanResultContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ScanResultContent({
  searchParams,
}: {
  searchParams: Promise<{ artist?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <ScanResultClient
      artist={params.artist ?? null}
      error={params.error ?? null}
    />
  );
}
