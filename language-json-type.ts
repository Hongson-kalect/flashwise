// kaikki-mapping.ts
// Types for Kaikki "JSON data structure browser" mapping
// These are intentionally permissive on many fields because real data is heterogeneous.

export type ID = string | number;

/** Generic key-value for template args or unknown nested objects */
export type KV = Record<string, unknown>;

/** Basic localized string fields often seen */
export interface LocalizedString {
  // e.g. "english", "roman", "word", "alt", "text", "source", ...
  [langOrKey: string]: string | undefined;
}

/** A minimal node present in many places */
export interface BaseNode {
  word?: string;
  english?: string;
  alt?: string;
  roman?: string;
  text?: string;
  source?: string;
  sense?: string;
  qualifier?: string;
  type?: string;
  depth?: number;
  head_nr?: number;
  // raw_tags is sometimes array of strings
  raw_tags?: string[];
  // arbitrary tags array
  tags?: string[];
  topics?: string[];
  urls?: string[];
  // counts / reach etc. (the mapping shows "reached X times")
  reached?: number;
  // nested arbitrary fields
  [k: string]: unknown;
}

/** Ruby entries (used for Japanese ruby text) */
export interface RubyEntry {
  ruby?: string; // or nested array, allow flexible types
  // sometimes ruby is a tuple/array in data; allow any
  [k: string]: unknown;
}

/** Template expansion info */
export interface TemplateInfo {
  name?: string;
  expansion?: string;
  args?: KV; // args: object of template args
}

/** Etymology template structure */
export interface EtymologyTemplate {
  name?: string;
  expansion?: string;
  args?: KV;
}

/** Etymology example */
export interface EtymologyExample {
  english?: string;
  raw_tags?: string[];
  ref?: string;
  roman?: string;
  tags?: string[];
  text?: string;
  type?: string;
}

/** Form entry (inflection forms) */
export interface FormEntry {
  form?: string;
  ipa?: string;
  roman?: string;
  head_nr?: number;
  raw_tags?: string[];
  source?: string;
  tags?: string[];
  topics?: string[];
  ruby?: RubyEntry[] | any[]; // flexible
}

/** A typical "sense" object */
export interface SenseEntry {
  glosses?: string[]; // or "gloss" sometimes
  definition?: string;
  examples?: string[] | { text?: string; ref?: string }[];
  translations?: TranslationEntry[]; // optional
  tags?: string[];
  topics?: string[];
  source?: string;
  [k: string]: unknown;
}

/** Translation entry (target word + language, sometimes nested) */
export interface TranslationEntry {
  lang?: string; // e.g. "vi", "fr"
  word?: string;
  sense?: string | number;
  comment?: string;
  // sometimes translations are grouped; flexible
  [k: string]: unknown;
}

/** Derived/related/coordinate/etc entries commonly share fields: */
export interface RelatedEntry extends BaseNode {
  roman?: string;
  raw_tags?: string[];
  sense?: string;
  ruby?: RubyEntry[] | any[];
  topics?: string[];
}

/** Descendant structure (complex nested with templates etc.) */
export interface DescendantEntry {
  depth?: number;
  templates?: TemplateInfo[];
  text?: string;
}

/** The generic object shape for array entries in the mapping */
export interface MappingArrayItem {
  // Many keys optional, since mapping is union of all nodes
  alt?: string;
  english?: string;
  roman?: string;
  word?: string;
  sense?: string | number;
  tags?: string[];
  raw_tags?: string[];
  topics?: string[];
  urls?: string[];
  source?: string;
  reached?: number;
  // nested objects/arrays
  ruby?: RubyEntry[] | any[];
  templates?: TemplateInfo[];
  forms?: FormEntry[];
  senses?: SenseEntry[];
  etymology_examples?: EtymologyExample[];
  etymology_templates?: EtymologyTemplate[];
  descendants?: DescendantEntry[];
  // arbitrary expansion to allow unknown fields
  [k: string]: unknown;
}

/** The top-level mapping: property -> array of mapping items */
export interface KaikkiMapping {
  // known top-level keys (subset) — each key maps to an array of items
  abbreviations?: MappingArrayItem[];
  alt_of?: MappingArrayItem[];
  antonyms?: MappingArrayItem[];
  categories?: MappingArrayItem[]; // possibly huge count
  coordinate_terms?: MappingArrayItem[];
  derived?: MappingArrayItem[];
  descendants?: MappingArrayItem[];
  etymology_examples?: MappingArrayItem[];
  etymology_templates?: MappingArrayItem[];
  etymology_text?: MappingArrayItem[];
  form_of?: MappingArrayItem[];
  forms?: MappingArrayItem[];
  head_templates?: MappingArrayItem[];
  holonyms?: MappingArrayItem[];
  hyponyms?: MappingArrayItem[];
  hypernyms?: MappingArrayItem[];
  // ... many other keys possible
  // fallback: allow arbitrary other keys with arrays of generic items
  [otherKey: string]: MappingArrayItem[] | undefined;
}

/* -----------------------
   Example usage hints:

import mappingJson from './mapping.json' assert { type: 'json' } ;
const mapping: KaikkiMapping = mappingJson as KaikkiMapping;

mapping.forms?.forEach(f => {
  if (f.form) console.log(f.form);
});

   ----------------------- */

export default KaikkiMapping;
