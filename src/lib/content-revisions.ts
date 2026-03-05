import "server-only";

import { emptyContent, normalizeSnapshotContent, SiteContent } from "@/lib/site-content";
import { restInsert, restSelect, restUpdate } from "@/lib/supabase-rest";

export type RevisionStatus = "draft" | "published" | "archived";

interface RevisionRow {
  id: number;
  status: RevisionStatus;
  snapshot: unknown;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface RevisionMeta {
  id: number;
  status: RevisionStatus;
  note: string | null;
  createdAt: string;
}

export interface RevisionBundle {
  draft: SiteContent;
  published: SiteContent;
  history: RevisionMeta[];
}

function toMeta(row: RevisionRow): RevisionMeta {
  return {
    id: row.id,
    status: row.status,
    note: row.note,
    createdAt: row.created_at,
  };
}

async function getLatestByStatus(status: RevisionStatus): Promise<RevisionRow | null> {
  const rows = await restSelect<RevisionRow>("content_revisions", {
    status: `eq.${status}`,
    order: "updated_at.desc",
    limit: "1",
  });
  return rows[0] || null;
}

export async function getRevisionBundle(): Promise<RevisionBundle> {
  const [draftRow, publishedRow, historyRows] = await Promise.all([
    getLatestByStatus("draft"),
    getLatestByStatus("published"),
    restSelect<RevisionRow>("content_revisions", {
      status: "in.(published,archived)",
      order: "created_at.desc",
      limit: "20",
    }),
  ]);

  const published = normalizeSnapshotContent(publishedRow?.snapshot || emptyContent);

  let draft: SiteContent;
  if (draftRow) {
    draft = normalizeSnapshotContent(draftRow.snapshot);
  } else {
    draft = published;
    const inserted = await restInsert<RevisionRow>("content_revisions", {
      status: "draft",
      snapshot: draft,
      note: "Auto-created draft from published",
    });

    if (inserted[0]) {
      return {
        draft: normalizeSnapshotContent(inserted[0].snapshot),
        published,
        history: historyRows.map(toMeta),
      };
    }
  }

  return {
    draft,
    published,
    history: historyRows.map(toMeta),
  };
}

export async function saveDraftSnapshot(snapshot: unknown): Promise<SiteContent> {
  const normalized = normalizeSnapshotContent(snapshot);
  const draftRow = await getLatestByStatus("draft");

  if (!draftRow) {
    const inserted = await restInsert<RevisionRow>("content_revisions", {
      status: "draft",
      snapshot: normalized,
      note: "Draft created",
    });
    return normalizeSnapshotContent(inserted[0]?.snapshot || normalized);
  }

  const updated = await restUpdate<RevisionRow>(
    "content_revisions",
    { id: `eq.${draftRow.id}` },
    {
      snapshot: normalized,
      note: "Draft updated",
    }
  );

  return normalizeSnapshotContent(updated[0]?.snapshot || normalized);
}

export async function publishDraft(note?: string): Promise<RevisionMeta> {
  const draftRow = await getLatestByStatus("draft");
  if (!draftRow) {
    throw new Error("Draft not found.");
  }

  await restUpdate<RevisionRow>(
    "content_revisions",
    { status: "eq.published" },
    { status: "archived", note: "Archived on new publish" }
  );

  const inserted = await restInsert<RevisionRow>("content_revisions", {
    status: "published",
    snapshot: normalizeSnapshotContent(draftRow.snapshot),
    note: note || "Published from draft",
  });

  const row = inserted[0];
  if (!row) {
    throw new Error("Failed to publish draft.");
  }

  return toMeta(row);
}

export async function restoreDraftFromRevision(revisionId: number): Promise<SiteContent> {
  const rows = await restSelect<RevisionRow>("content_revisions", {
    id: `eq.${revisionId}`,
    limit: "1",
  });

  const source = rows[0];
  if (!source) {
    throw new Error("Revision not found.");
  }

  const normalized = normalizeSnapshotContent(source.snapshot);
  const draftRow = await getLatestByStatus("draft");

  if (!draftRow) {
    const inserted = await restInsert<RevisionRow>("content_revisions", {
      status: "draft",
      snapshot: normalized,
      note: `Restored from revision #${revisionId}`,
    });
    return normalizeSnapshotContent(inserted[0]?.snapshot || normalized);
  }

  const updated = await restUpdate<RevisionRow>(
    "content_revisions",
    { id: `eq.${draftRow.id}` },
    {
      snapshot: normalized,
      note: `Restored from revision #${revisionId}`,
    }
  );

  return normalizeSnapshotContent(updated[0]?.snapshot || normalized);
}

export async function getDraftContent(): Promise<SiteContent> {
  const draftRow = await getLatestByStatus("draft");
  if (!draftRow) return emptyContent;
  return normalizeSnapshotContent(draftRow.snapshot);
}
