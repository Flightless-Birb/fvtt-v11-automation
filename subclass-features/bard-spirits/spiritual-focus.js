try {
    if (args[0].tag == "DamageBonus" && ["mwak", "rwak", "msak", "rsak", "save", "other", "healing"].includes(args[0].item.system.actionType) && args[0].item.type == "spell" && args[0].item.system.school && (((item.flags?.["tidy5e-sheet"]?.parentClass.toLowerCase().includes("bard")) || (args[0].item.system.chatFlavor.toLowerCase().includes("bard"))) || (!args[0].item.flags?.["tidy5e-sheet"]?.parentClass && !args[0].item.system.chatFlavor && ["prepared", "always"].includes(args[0].item.system?.preparation?.mode))) && args[0].actor?.classes?.bard?.system?.levels >= 6) return { damageRoll: "1d6", flavor: "Spiritual Focus" }
} catch (err) {console.error("Spiritual Focus - ", err)}

//WIP should have dialog and update workflow