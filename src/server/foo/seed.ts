import type { Database } from "@/db/client";
import { fetchJsonAsset } from "@/lib/assets";
import * as v from "valibot";
import { Foo } from "./foo";

export async function seedFooData({
  db,
  debug = false,
}: {
  db: Database;
  debug?: boolean;
}) {
  const asset = fetchJsonAsset(v.array(Foo.Detail), "NAME");

  return db.transaction(async (tx) => {
    const { rowsAffected: deletedCount } = await tx.delete(Foo.table);
    if (debug) {
      console.log(`Deleted ${deletedCount} ISO 3661 records.`);
    }

    const records: Foo.New[] = [];
    for (const record of asset) {
      const records = Object.entries(record).map(([key, value]) => ({
        key,
        value,
      }));
      for (const entry of record) {
        if (!record.key) {
          continue;
        }
        const record = {
          id: division.id,
        } satisfies Foo.New;
        records.push(record);
      }
    }

    const resultSet = await tx.insert(Foo.table).values(records);
    if (debug) {
      console.log(`Inserted ${resultSet.rowsAffected} foo records.`);
    }
    return resultSet;
  });
}
