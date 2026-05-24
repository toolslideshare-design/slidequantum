import { writeFileSync, mkdirSync } from "fs";
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
} from "../src/config/homepage-content";

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
