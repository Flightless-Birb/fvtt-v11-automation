try {
    if (args[0].tag == "DamageBonus" && ["mwak", "rwak"].includes(args[0].item.system.actionType)) return { damageRoll: "1d4[radiant]", type: "radiant", flavor: "Divine Favor" }
} catch (err) {console.error("Divine Favor - ", err)}