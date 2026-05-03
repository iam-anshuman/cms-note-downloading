/**
 * lib/categories.js
 *
 * Single source of truth for the navigation categories.
 * The public nav links AND the admin upload dropdown both import from here
 * so they are always in sync.
 */

export const NAV_CATEGORIES = [
  { label: "Class 12",    value: "class-12",    subject: "Class 12"    },
  { label: "Class 11",    value: "class-11",    subject: "Class 11"    },
  { label: "Class 10",   value: "class-10",    subject: "Class 10"    },
  { label: "NEET",        value: "neet",         subject: "NEET"        },
  { label: "B.Tech",      value: "btech",        subject: "B.Tech"      },
];


/**
 * Maps a URL query param value (e.g. "class-12") to the DB subject string.
 */
export function categoryValueToSubject(value) {
  return NAV_CATEGORIES.find((c) => c.value === value)?.subject ?? null;
}
