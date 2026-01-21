export type FoundationOutput = {
  id: string;
  project: string;
  revision: string;
  description: string;
  excavation_volume?: number | null;
  concrete_volume?: number | null;
  backfill_volume?: number | null;
  steel_volume?: number | null;
  created_at: Date;
};

