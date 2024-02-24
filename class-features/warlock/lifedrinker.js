try {
    if (args[0].tag === "DamageBonus" && args[0].item.name.includes("(Pact Weapon)")) return { damageRoll: `${Math.max(args[0].actor.system.abilities.cha.mod, 1)}[necrotic]`, type: "necrotic", flavor: "Lifedrinker" }
} catch (err) {console.error("Lifedrinker Macro - ", err)}