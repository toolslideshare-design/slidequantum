import { writeFileSync, mkdirSync } from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Read TS file and evaluate exports via dynamic import after building - use direct JSON seed instead
import {
  heroContent,
  howItWorksContent,
  differentiatorsContent,
  formatsContent,
  featuresContent,
  trustedUsersContent,
  comparisonContent,
  conclusionContent,
  faqContent,
} from "../src/config/homepage-content.ts";

mkdirSync("src/data", { recursive: true });

writeFileSync(
  "src/data/homepage-content.json",
  JSON.stringify(
    {
      heroContent,
      howItWorksContent,
      differentiatorsContent,
      formatsContent,
      featuresContent,
      trustedUsersContent,
      comparisonContent,
      conclusionContent,
      faqContent,
    },
    null,
    2
  )
);

console.log("Exported homepage-content.json");
