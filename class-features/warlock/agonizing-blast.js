try {
    if (args[0].tag == "DamageBonus" && args[0].item.name.includes("Eldritch Blast")) return { damageRoll: `${args[0].actor.system.abilities.cha.mod}`, flavor: "Agonizing Blast" }
} catch (err) {console.error("Agonizing Blast Macro - ", err)}