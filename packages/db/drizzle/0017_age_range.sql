-- Replace children.birth_date (date) with children.age_range (text enum)
-- Business rule A3: store only age range, never exact birth date.

ALTER TABLE "children" ADD COLUMN "age_range" text;

UPDATE "children" SET "age_range" = CASE
  WHEN "birth_date" IS NULL THEN '6-8'
  WHEN AGE("birth_date") < interval '6 years' THEN '0-5'
  WHEN AGE("birth_date") < interval '9 years' THEN '6-8'
  WHEN AGE("birth_date") < interval '12 years' THEN '9-11'
  WHEN AGE("birth_date") < interval '15 years' THEN '12-14'
  ELSE '15-17'
END;

ALTER TABLE "children" ALTER COLUMN "age_range" SET NOT NULL;
ALTER TABLE "children" DROP COLUMN "birth_date";
