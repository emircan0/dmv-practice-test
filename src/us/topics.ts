// Editorial study headings informed by official driver handbooks. These are not
// universal official exam sections or topic quotas. Published questions determine
// which topics are offered for the selected state. Keep road-signs separate so
// existing verified signs subsection rules retain their exact scope.
export const EXAM_TOPICS = [
  { id: "road-signs", label: "categorySigns", icon: "signs", color: "#0066FF" },
  { id: "signals-markings", label: "topicSignals", icon: "signals", color: "#FF195C" },
  { id: "right-of-way", label: "topicRightOfWay", icon: "intersection", color: "#9561FF" },
  { id: "turns-passing", label: "topicTurns", icon: "turns", color: "#00A68A" },
  { id: "speed-distance", label: "topicSpeed", icon: "speed", color: "#FF9900" },
  { id: "parking", label: "topicParking", icon: "parking", color: "#0066FF" },
  { id: "safe-driving", label: "categorySafety", icon: "safety", color: "#00A68A" },
  { id: "alcohol-drugs", label: "topicAlcohol", icon: "alcohol", color: "#FF195C" },
  { id: "special-conditions", label: "topicConditions", icon: "conditions", color: "#9561FF" },
  { id: "sharing-the-road", label: "categorySharing", icon: "sharing", color: "#FF9900" },
] as const;

// Legacy broad topic IDs remain usable; changing display headings must never
// silently reclassify a reviewed question or affect old scores.
const LEGACY_TOPICS = [
  { id: "road-rules", label: "categoryRules", icon: "rules", color: "#FF195C" },
] as const;
export const topicInfo = (id: string) =>
  [...EXAM_TOPICS, ...LEGACY_TOPICS].find((topic) => topic.id === id);
