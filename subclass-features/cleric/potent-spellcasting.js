try {
    if (args[0].tag == "DamageBonus" && ["mwak", "rwak", "msak", "rsak", "save", "other"].includes(args[0].item.system.actionType) && args[0].item.type == "spell" && args[0].item.system.level == 0 && args[0].item.system.school && (((item.flags?.["tidy5e-sheet"]?.parentClass.toLowerCase().includes("cleric")) || (args[0].item.system.chatFlavor.toLowerCase().includes("cleric"))) || (!args[0].item.flags?.["tidy5e-sheet"]?.parentClass && !args[0].item.system.chatFlavor && ["prepared", "always"].includes(args[0].item.system?.preparation?.mode)))) return { damageRoll: `${args[0].actor.system.abilities.wis.mod}`, flavor: "Potent Spellcasting" }
} catch (err) {console.error("Potent Spellcasting - ", err)}