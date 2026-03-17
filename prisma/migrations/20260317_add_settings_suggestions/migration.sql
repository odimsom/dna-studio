-- Add user settings (JSON for LLM/image provider preferences, API keys)
ALTER TABLE "User" ADD COLUMN "settings" JSONB;

-- Add cached campaign suggestions to Brand
ALTER TABLE "Brand" ADD COLUMN "suggestions" JSONB;
