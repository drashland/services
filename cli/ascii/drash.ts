import { colors } from "../../deps.ts";

let ascii = `@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@##@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@%####@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@#######@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@#######@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@#######@@@@@@@@@@@
@@@@@@@@@/////////////#####%%@@@@@@@@@@@
@@@@@@@@@//////////////(#%%%%@@@@@@@@@@@
@@@@@@@@@/////////////////%%%@@@@@@@@@@@
@@@@@@@@@////((/@@@@@@%%%%%%%@@@@@@@@@@@
@@@@@@@@@//(/(//@@@@@@%%%%%%%@@@@@@@@@@@
@@@@@@@@@(((/((/@@@@@@%%%%&&&@@@@@@@@@@@
@@@@@@@@@((((///@@@@@@%%&&&&&@@@@@@@@@@@
@@@@@@@@@(((((###########&&&&@@@@@@@@@@@
@@@@@@@@@(((###########%#%%%%%@@@@@@@@@@
@@@@@@@@#############%%%#%%%#%%%@@@@@@@@`;

export const drashLogoInRawAscii = ascii;

// Remove the empty spaces (which are the "@"s)
ascii = ascii.replace(/@/g, " ");

export const drashLogoInAsciiWithoutColour = ascii;

let n = 0;

// DO RED
const maxHashesForRed = 33;
n = 0;
ascii = ascii.replace(
  /#/g,
  (match) => n++ < maxHashesForRed ? colors.red("#") : "#",
);
n = 0;
const maxAndsForRed = 53;
ascii = ascii.replace(
  /&/g,
  (match) => n++ < maxAndsForRed ? colors.red("&") : "&",
);
n = 0;
const maxPercentForRed = 30;
ascii = ascii.replace(
  /%/g,
  (match) => n++ < maxPercentForRed ? colors.red("%") : "%",
);

// DO YELLOW
const maxSlashesforYellow = 44;
n = 0;
ascii = ascii.replace(
  /\//g,
  (match) => n++ < maxSlashesforYellow ? colors.yellow("/") : "/",
);
n = 0;
const maxBracketForYellow = 1;
ascii = ascii.replace(
  /\(/g,
  (match) => n++ < maxBracketForYellow ? colors.yellow("(") : "(",
);

// DO BLUE
n = 0;
const maxSlashesForBlue = 200; // way over, but no more after so we can specify 10000 if we want
ascii = ascii.replace(
  /\//g,
  (match) =>
    n++ < maxSlashesForBlue && n > maxSlashesforYellow ? colors.blue("/") : "/",
);
n = 0;
const maxBracketsForBlue = 82;
ascii = ascii.replace(
  /\(/g,
  (match) =>
    n++ < maxBracketsForBlue && n > maxBracketForYellow
      ? colors.blue("(")
      : "(",
);

// DO GREEN
n = 0;
const maxHashesForGreen = 210;
ascii = ascii.replace(
  /#/g,
  (match) =>
    n++ < maxHashesForGreen && n > maxHashesForRed ? colors.green("#") : "#",
);
n = 0;
const maxPercentForGreen = 200;
ascii = ascii.replace(
  /%/g,
  (match) =>
    n++ < maxPercentForGreen && n > maxPercentForRed ? colors.green("%") : "%",
);
n = 0;
const maxAndsForGreen = 200;
ascii = ascii.replace(
  /&/g,
  (match) =>
    n++ < maxAndsForGreen && n > maxAndsForRed ? colors.green("&") : "&",
);

export const drashLogoInAsciiWithColour = ascii;
