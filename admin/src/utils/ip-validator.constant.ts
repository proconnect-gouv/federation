const EMPTY_REGEX = `(^$)`;

const IPV4SEG = `(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])`;
const IPV4ADDR = `(${IPV4SEG}\\.){3,3}${IPV4SEG}`;
const IPV4_MASK = `(?:\\/[0-2]\\d|\\/3[0-2])?$`;
const IPV4ADDR_WITH_MASK = `(${IPV4ADDR}${IPV4_MASK})`;

// https://stackoverflow.com/questions/53497/regular-expression-that-matches-valid-ipv6-addresses
const IPV6SEG = `[0-9a-fA-F]{1,4}`;
const IPV6ADDR = `((${IPV6SEG}:){7,7}${IPV6SEG}|(${IPV6SEG}:){1,7}:|(${IPV6SEG}:){1,6}:${IPV6SEG}|(${IPV6SEG}:){1,5}(:${IPV6SEG}){1,2}|(${IPV6SEG}:){1,4}(:${IPV6SEG}){1,3}|(${IPV6SEG}:){1,3}(:${IPV6SEG}){1,4}|(${IPV6SEG}:){1,2}(:${IPV6SEG}){1,5}|${IPV6SEG}:((:${IPV6SEG}){1,6})|:((:${IPV6SEG}){1,7}|:))`;
const IPV6_MASK = `(%.+)?\\s*(\\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$`;
const IPV6ADDR_WITH_MASK = `(${IPV6ADDR}${IPV6_MASK})`;

export const IP_VALIDATOR_REGEX = new RegExp(
  `${EMPTY_REGEX}|${IPV4ADDR_WITH_MASK}|${IPV6ADDR_WITH_MASK}`,
);
