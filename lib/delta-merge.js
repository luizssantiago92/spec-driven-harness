const REQUIREMENT_HEADING =
  /^(?<level>#{2,6})\s*(?<id>[A-Z][A-Z0-9]{1,9}-\d{2,4})\s*[:\-–]?\s*(?<title>.*)$/gm;
const ANY_HEADING = /^(?<level>#{1,6})\s+\S/m;

const DELTA_SECTIONS = [
  "ADDED Requirements",
  "MODIFIED Requirements",
  "REMOVED Requirements",
];

const REMOVED_ID = /^\s*(?:-\s*)?(?<id>[A-Z][A-Z0-9]{1,9}-\d{2,4})\b/gm;

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isDeltaSpec(text) {
  return DELTA_SECTIONS.some((heading) => hasSection(text, heading));
}

/**
 * @param {string} text
 * @param {string} heading
 * @returns {boolean}
 */
function hasSection(text, heading) {
  const pattern = new RegExp(`^#{1,6}\\s+${escapeRegExp(heading)}\\s*$`, "im");
  return pattern.test(text);
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * @param {string} text
 * @param {string} sectionHeading
 * @returns {string | null}
 */
function sectionBody(text, sectionHeading) {
  const headingPattern = new RegExp(
    `^(?<level>#{2,6})\\s*${escapeRegExp(sectionHeading)}\\b`,
    "im",
  );
  const match = headingPattern.exec(text);
  if (!match) {
    return null;
  }

  const level = match[0].match(/^#+/)?.[0].length ?? 2;
  const start = match.index + match[0].length;
  let end = text.length;

  const rest = text.slice(start);
  for (const heading of rest.matchAll(/^(#{1,6})\s+\S/gm)) {
    if (heading.index === undefined) {
      continue;
    }
    if (heading[1].length <= level) {
      end = start + heading.index;
      break;
    }
  }

  return text.slice(start, end);
}

/**
 * @param {string} scoped
 * @returns {Map<string, string>}
 */
function extractRequirementBlocks(scoped) {
  /** @type {Map<string, string>} */
  const blocks = new Map();

  const headingRe = new RegExp(REQUIREMENT_HEADING.source, REQUIREMENT_HEADING.flags);
  let match = headingRe.exec(scoped);

  while (match) {
    const level = match.groups.level.length;
    const id = match.groups.id;
    const blockStart = match.index;
    let blockEnd = scoped.length;

    const scanRe = new RegExp(REQUIREMENT_HEADING.source, REQUIREMENT_HEADING.flags);
    scanRe.lastIndex = match.index + match[0].length;
    let next = scanRe.exec(scoped);
    while (next) {
      if (next.groups.level.length <= level) {
        blockEnd = next.index;
        break;
      }
      next = scanRe.exec(scoped);
    }

    const headingLine = scoped.slice(blockStart, match.index + match[0].length).split("\n")[0];
    const body = scoped.slice(match.index + match[0].length, blockEnd).trimEnd();
    blocks.set(id, `${headingLine}\n${body}`.trimEnd());

    headingRe.lastIndex = blockEnd;
    match = headingRe.exec(scoped);
  }

  return blocks;
}

/**
 * @param {string} text
 * @returns {Map<string, string>}
 */
export function extractDomainRequirements(text) {
  const requirementsSection = sectionBody(text, "Requirements");
  if (!requirementsSection) {
    return new Map();
  }
  return extractRequirementBlocks(requirementsSection);
}

/**
 * @param {string} domainSpec
 * @param {Map<string, string>} requirements
 * @returns {string}
 */
function writeDomainRequirements(domainSpec, requirements) {
  const blocks = [...requirements.values()];
  const requirementsBody = blocks.length ? `\n${blocks.join("\n\n")}\n` : "\n- none\n";

  if (hasSection(domainSpec, "Requirements")) {
    const headingPattern = /^#{2,6}\s*Requirements\b/im;
    const match = headingPattern.exec(domainSpec);
    if (!match) {
      return domainSpec;
    }

    const level = match[0].match(/^#+/)?.[0] ?? "##";
    const start = match.index;
    const levelLen = level.length;
    let end = domainSpec.length;

    for (const heading of domainSpec.slice(start + match[0].length).matchAll(/^(#{1,6})\s+\S/gm)) {
      if (heading.index === undefined) {
        continue;
      }
      if (heading[1].length <= levelLen) {
        end = start + match[0].length + heading.index;
        break;
      }
    }

    return (
      domainSpec.slice(0, start) +
      `${level} Requirements${requirementsBody}` +
      domainSpec.slice(end).replace(/^\n+/, "")
    );
  }

  const trimmed = domainSpec.trimEnd();
  return `${trimmed}\n\n## Requirements${requirementsBody}`;
}

/**
 * @param {string} scoped
 * @returns {string[]}
 */
function extractRemovedIds(scoped) {
  if (!scoped) {
    return [];
  }
  if (/\bnone\b/i.test(scoped.trim())) {
    return [];
  }

  /** @type {string[]} */
  const ids = [];
  for (const match of scoped.matchAll(REMOVED_ID)) {
    ids.push(match.groups.id);
  }
  return ids;
}

/**
 * Merge a feature spec (full or delta) into a domain spec.
 *
 * @param {string} domainSpec
 * @param {string} featureSpec
 * @returns {{ spec: string, summary: string[] }}
 */
export function mergeFeatureIntoDomain(domainSpec, featureSpec) {
  const summary = [];
  let requirements = extractDomainRequirements(domainSpec);

  if (isDeltaSpec(featureSpec)) {
    const added = sectionBody(featureSpec, "ADDED Requirements");
    const modified = sectionBody(featureSpec, "MODIFIED Requirements");
    const removed = sectionBody(featureSpec, "REMOVED Requirements");

    for (const [id, block] of extractRequirementBlocks(added ?? "")) {
      requirements.set(id, block);
      summary.push(`ADDED ${id}`);
    }

    for (const [id, block] of extractRequirementBlocks(modified ?? "")) {
      requirements.set(id, block);
      summary.push(`MODIFIED ${id}`);
    }

    for (const id of extractRemovedIds(removed ?? "")) {
      if (requirements.delete(id)) {
        summary.push(`REMOVED ${id}`);
      } else {
        summary.push(`REMOVED ${id} (not in domain spec)`);
      }
    }
  } else {
    const fullRequirements = sectionBody(featureSpec, "Requirements");
    if (fullRequirements) {
      requirements = extractRequirementBlocks(fullRequirements);
      summary.push(`copied ${requirements.size} requirement(s) from full spec`);
    } else {
      summary.push("full spec has no Requirements section — domain spec unchanged");
    }
  }

  return {
    spec: writeDomainRequirements(domainSpec, requirements),
    summary,
  };
}

/**
 * @param {string} domain
 * @param {string} featureId
 * @returns {string}
 */
export function domainSpecStub(domain, featureId) {
  return `# Domain: ${domain}

> Seeded by archive-feature from \`${featureId}\`.

## Requirements

- none
`;
}
