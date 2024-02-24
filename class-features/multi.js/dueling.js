try {
	if (args[0].tag != "DamageBonus" || args[0].item.system.actionType != "mwak" || args[0].item.system.properties?.two) return; 
	let equippedList = args[0].actor.items.filter((i) => i.system.type == "weapon" && i.system.equipped);
	if (equippedList.length > 1) return;
	return {damageRoll: "2", flavor: "Dueling"}
} catch (err) {console.error("Fighting Style: Dueling Macro - ", err)}