try {
    if (args[0].tag == "DamageBonus" && args[0].item.type == "spell" && (args[0].spellLevel > 0 || !args[0].item.system.school) && args[0].item.system.actionType == "heal") return { damageRoll: `${2 + args[0].spellLevel}`, flavor: "Disciple of Life" };
} catch (err) {console.error("Disciple of Life Macro - ", err)}