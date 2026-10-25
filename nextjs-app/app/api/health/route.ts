// What this file does: reports that the app is serving data from its local snapshot.
import { getSnapshotMetadata } from "@/db/queries";

export async function GET() {
  const snapshot = await getSnapshotMetadata();
  return Response.json({
    status: "ok",
    database: false,
    dataSource: "snapshot",
    generatedAt: snapshot.generatedAt,
  });
}
