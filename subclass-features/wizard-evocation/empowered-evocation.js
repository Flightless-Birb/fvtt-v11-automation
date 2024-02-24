try {
    if (args[0].tag == "DamageBonus" && ["mwak", "rwak", "msak", "rsak", "save", "other"].includes(args[0].item.system.actionType) && args[0].item.type == "spell" && args[0].item.system.school == "evo" && (((item.flags?.["tidy5e-sheet"]?.parentClass.toLowerCase().includes("wizard")) || (args[0].item.system.chatFlavor.toLowerCase().includes("wizard"))) || (!args[0].item.flags?.["tidy5e-sheet"]?.parentClass && !args[0].item.system.chatFlavor && ["prepared", "always"].includes(args[0].item.system?.preparation?.mode)))) return { damageRoll: `${args[0].actor.system.abilities.int.mod}`, flavor: "Empowered Evocation" }
} catch (err) {console.error("Empowered Evocation - ", err)}

//WIP should have dialog and update workflow