try {
    if (args[0].macroPass == "postPreambleComplete") {
		args[0].targets.forEach(async t => {
			if (!t.actor || !MidiQOL.typeOrRace(t.actor).toLowerCase().includes("plant")) return;
			const effectData = {
                changes: [{ key: "flags.midi-qol.onUseMacroName", mode: 0, value: "Compendium.dnd-5e-core-compendium.macros.0aKzjEuQWK5O3fc0, preTargetSave", priority: 20 }, { key: "flags.midi-qol.blight", mode: 2, value: args[0].uuid, priority: 20 }],
                disabled: false,
				duration: { seconds: 1, turns: 1 },
				flags: { dae: { specialDuration: ["combatEnd"] } },
                name: "Blight Save Disadvantage",
                icon: args[0].item.img
            };
            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: t.actor.uuid, effects: [effectData] });
		});
	} else if (args[0].macroPass == "preTargetSave" && args[0].workflow.saveDetails && args[0].options.actor.flags["midi-qol"]?.blight?.includes(args[0].uuid)) {
		if (MidiQOL.typeOrRace(args[0].options.actor).toLowerCase().includes("plant")) args[0].workflow.saveDetails.disadvantage = true;
        await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: args[0].options.actor.uuid, effects: [args[0].options.actor.effects.find(e => e.name == "Blight Save Disadvantage").id] });
	} else if (args[0].macroPass == "preDamageRollComplete" && args[0].targets.find(t => t.actor && MidiQOL.typeOrRace(t.actor).toLowerCase().includes("plant"))) {
        let newDamageRolls = args[0].workflow.damageRolls;
        let newBonusDamageRolls = args[0].workflow.bonusDamageRolls;
        if (newDamageRolls) newDamageRolls.forEach(async r => {
            r.terms.forEach(t => { 
                t.results.forEach(d => {
                    if (d.result >= t.faces) return;
                    Object.assign(d, { rerolled: true, active: false });
                    t.results.push({ result: t.faces, active: true, hidden: true });
                    r._total = r._evaluateTotal();
                });
            });
        });
        if (newBonusDamageRolls) newBonusDamageRolls.forEach(async r => {
            r.terms.forEach(t => { 
                t.results.forEach(d => {
                    if (d.result >= t.faces) return;
                    Object.assign(d, { rerolled: true, active: false });
                    t.results.push({ result: t.faces, active: true, hidden: true });
                    r._total = r._evaluateTotal();
                });
            });
        });
        if (newDamageRolls) await args[0].workflow.setDamageRolls(newDamageRolls);
        if (newBonusDamageRolls) await args[0].workflow.setBonusDamageRolls(newBonusDamageRolls);
    }
} catch (err) {console.error("Blight Macro - ", err)}