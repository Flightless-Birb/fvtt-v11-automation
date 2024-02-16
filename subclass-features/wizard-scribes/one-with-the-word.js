// reaction isDamaged
// reaction=="isDamaged"&&canvas.tokens.placeables.find(t=>t.name.includes("Manifest Mind")&&t.document.flags?.["midi-qol"]?.parentUuid==args[0].actor.uuid)
// set dr 9999
// roll 3d6 (item damage midi-none)
// JUST DO IT MANUALLY????????

try {
    if (args[0].macroPass != "postActiveEffects") return;
    const token = canvas.tokens.placeables.find(t => t.name.includes("Manifest Mind") && t.document.flags?.["midi-qol"]?.parentUuid == args[0].actor.uuid);
    if (token) await token.document.delete();
} catch (err) {console.error("One with the Word Macro - ", err)}