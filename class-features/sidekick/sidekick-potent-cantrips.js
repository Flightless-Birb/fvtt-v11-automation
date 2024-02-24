try {
    if (args[0].tag == "OnUse" && args[0].macroPass == "postDamageRoll" && args[0].damageRoll && args[0].item.type == "spell" && args[0].item.system.level == 0) {
		return { damageRoll: `${args[0].actor.system.abilities[args[0].actor.system.attributes.spellcasting].mod}`, flavor: "Potent Cantrips" }
	}
} catch (err) {console.error("Potent Cantrip Macro - ", err)}