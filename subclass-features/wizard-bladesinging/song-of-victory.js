try {
    if (args[0].tag == "DamageBonus" && args[0].item.system.actionType == "mwak" && args[0].actor.effects.find(e => e.name.includes("Bladesong") && !e.disabled)) return { damageRoll: `${Math.max(args[0].actor.system.abilities.int.mod, 1)}`, flavor: "Song of Victory" }
} catch (err) {console.error("Song of Victory Macro - ", err)}