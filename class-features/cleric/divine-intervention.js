try {
    if (args[0].macroPass != "postActiveEffects") return;
    const levels = args[0].actor?.classes?.cleric?.system?.levels ?? 10;
    if (args[0].damageRoll.total <= levels || levels == 20) return;
    const usesItem = args[0].actor.items.find(i => i.name == "Divine Intervention" && i.system.uses);
    if (usesItem) await usesItem.update({ "system.uses.value": 6 });
    
} catch (err) {console.error("Divine Invervention Macro - ", err)}