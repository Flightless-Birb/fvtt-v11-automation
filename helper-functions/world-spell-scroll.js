Hooks.on("dnd5e.createScrollFromSpell", async (parent, item) => {
	try {
        item.system.properties = item.system.properties.filter(p => !["vocal", "somatic", "material"].includes(p));
        item.flags["midi-qol"] = parent.flags?.["midi-qol"];
		item.flags["midi-qol"].scroll = { level: parent.system.level, school: parent.system.school }
		item.flags.midiProperties = parent.flags?.midiProperties;
	} catch (err) {console.error("Spell Scroll World Macro - ", err)}
});

Hooks.on("midi-qol.preItemRoll", async (workflow) => {
	try {
        if (workflow.item.type != "consumable" || args[0].item.system.type.value != "scroll" || isNaN(workflow.item.flags?.["midi-qol"]?.scroll?.level)) return;
		workflow.spellLevel = workflow.item.flags?.["midi-qol"]?.scroll?.level;
	} catch (err) {console.error("Spell Scroll World Macro - ", err)}
});