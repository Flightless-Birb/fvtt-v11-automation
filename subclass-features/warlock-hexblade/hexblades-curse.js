try {
    const lastArg = args[args.length - 1];
    const tokenOrActor = await fromUuid(lastArg.actorUuid);
	const actor = tokenOrActor.actor ? tokenOrActor.actor : tokenOrActor;
    if (lastArg.tag == "DamageBonus" && ["mwak", "rwak", "msak", "rsak", "save", "other"].includes(lastArg.item.system.actionType) && lastArg.targets.find(t => t?.actor?.effects?.find(e => e.name.includes("Hexblade's Curse") && !e.disabled && e.origin.includes(lastArg.actor.uuid)))) {
        return { damageRoll: `${lastArg.actor.system.attributes.prof}`, flavor: "Hexblades Curse" }
    } else if (args[0] == "off" && lastArg["expiry-reason"] == "midi-qol:zeroHP" && lastArg.efData.changes.find(c => c.key == "flags.midi-qol.hexbladesCurse")) {
        const caster = lastArg.efData.changes.find(c => c.key == "flags.midi-qol.hexbladesCurse").value;
        const effectData = {
            disabled: false,
            changes: [{ key: "macro.execute", mode: 0, value: "Compendium.dnd-5e-core-compendium.macros.ou7ixEjAMkgowPWf", priority: "20" }],
            name: "Hexblade's Curse Restoration",
            icon: "icons/magic/unholy/projectile-smoke-trail-pink.webp"
        }
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: caster, effects: [effectData] });
    } else if (args[0] == "on" && lastArg.efData.name == "Hexblade's Curse Restoration") {
        await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [lastArg.efData._id] });
        const item = actor.items.find(i => i.name.includes("Hexblade's Curse"));
        const warlockLevels = actor.classes.warlock?.system?.levels ?? 1;
        let dialog = !item || warlockLevels < 14 || MidiQOL.checkIncapacitated(actor) ? false : new Promise((resolve) => {
            new Dialog({
				title: "Hexblade's Curse",
				content: "<p>Use Master of Hexes to spread your Hexblade's Curse to another creature?</p>",
				buttons: {
					Confirm: {
						label: "Confirm",
                        icon: '<i class="fas fa-check"></i>',
						callback: async () => {resolve(true)},
					},
					Cancel: {
                        label: "Cancel",
                        icon: '<i class="fas fa-times"></i>',
                        callback: () => {resolve(false)},
                    },
				},
				default: "Cancel",
                close: () => {resolve(false)}
			}).render(true);
		});
		let reapply = await dialog;
        if (reapply) {
            await item.update({ "system.uses.value": 1 });
            await MidiQOL.completeItemUse(item, {}, { showFullCard: true, createWorkflow: true, configureDialog: false, targetUuids: [], targetConfirmation: true });
        } else {
            const itemData = {
                name: "Hexblade's Curse Restoration",
                img: "icons/magic/unholy/projectile-smoke-trail-pink.webp",
                type: "feat",
                system: {
                    activation: { type: "special" },
                    target: { type: "self" },
                    actionType: "healing",
                    damage: { parts: [[`${Math.max(1, warlockLevels + actor.system.abilities.cha.mod)}`, "healing"]] }
                },
                flags: { autoanimations: { isEnabled: false } }
            }
            const healItem = new CONFIG.Item.documentClass(itemData, { parent: actor });
            await MidiQOL.completeItemUse(healItem, {}, { showFullCard: true, createWorkflow: true, configureDialog: false });
        }
    }
} catch (err) {console.error("Hexblade's Curse Macro - ", err)}