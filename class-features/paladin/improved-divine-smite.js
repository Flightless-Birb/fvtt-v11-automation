try {
    if (args[0].tag == "DamageBonus" && args[0].item.system.actionType == "mwak") return { damageRoll: "1d8[radiant]", type: "radiant", flavor: "Improved Divine Smite" }
} catch (err) {console.error("Improved Divine Smite Macro - ", err)}