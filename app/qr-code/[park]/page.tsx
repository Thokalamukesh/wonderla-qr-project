import React from "react";
import { notFound } from "next/navigation";
import { getPark } from "../_lib/store";
import QrCodeMain from "./main";

export const dynamic = "force-dynamic";

type Props = { params: { park: string } };

/** Server component: loads the park's config, hands it to the client UI. */
const ParkPage = async ({ params }: Props) => {
  const config = await getPark(params.park);
  if (!config || !config.active) notFound();
  return <QrCodeMain initialConfig={config} />;
};

export default ParkPage;
