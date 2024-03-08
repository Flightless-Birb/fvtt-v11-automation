try {
	const lastArg = args[args.length - 1];
	const token = canvas.tokens.get(lastArg.tokenId);
	const tokenOrActor = await fromUuid(lastArg.actorUuid);
	const actor = tokenOrActor.actor ? tokenOrActor.actor : tokenOrActor;
	const druidLevels = actor.classes.druid?.system?.levels ?? 2;
	if (lastArg.macroPass == "postActiveEffects" && !warpgate.mutationStack(token.document).getName("Wild Shape")) {
		const elementals = [
			{ name: "Air Elemental" },
            { name: "Earth Elemental" },
            { name: "Fire Elemental" },
            { name: "Water Elemental" },
		];const elementalOptions = elementals.reduce((acc, target) => acc += `<option value="${target.name}">${target.name} (CR ${target.cr >= 1 || target.cr == 0 ? target.cr : `1/${1/target.cr}`})</option>`, "");
		let dialog = new Promise((resolve) => {
			new Dialog({
			title: "Elemental Wild Shape",
			content: `
			<div style="display: flex; flex-direction: row; align-items: center; text-align: center; justify-content: center;">
				<p>Choose an elemental form to wild shape into.</p>
			</div>
			<form>
				<div style="display: flex; flex-direction: row; align-items: center; text-align: center; justify-content: center;">
					<label for="elemental">Elemental:</label><select id="elemental">${elementalOptions}</select>
				</div>
			</form>
			`,
			buttons: {
				confirm: {
					icon: '<i class="fas fa-check"></i>',
					label: "Confirm",
					callback: () => resolve($("#elemental")[0].value)
				},
				cancel: {
					icon: '<i class="fas fa-times"></i>',
					label: "Cancel",
					callback: () => {resolve(false)}
				}
			},
			default: "cancel",
			close: () => {resolve(false)}
			}).render(true);
		});
		let wildShapeChoice = await dialog;
		if (!wildShapeChoice) return;
		const effectData = {
			disabled: false,
			changes: [{ key: "macro.execute", mode: 0, value: "", priority: 20 }],
			flags: { "midi-qol": { wildShape: wildShapeChoice } },
			duration: { seconds: Math.min(druidLevels / 2) * 3600 },
			icon: "icons/creatures/mammals/elk-moose-marked-green.webp",
			name: "Wild Shape",
			origin: lastArg.item.uuid
		}
		if (druidLevels < 20) effectData.changes.push({ key: "flags.midi-qol.onUseMacroName", mode: 0, value: ", preTargeting", priority: 20 }); 
		await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] }); 
	} else if (args[0] == "on" && lastArg.efData.flags?.["midi-qol"]?.wildShape) {
		const gamePack = game.packs.get("dnd-5e-core-compendium.monsters");
		let packIndex = await gamePack.getIndex({'fields': ['name', 'type', 'folder']});
		let match = packIndex.find(a => a.name.toLowerCase() == lastArg.efData.flags?.["midi-qol"]?.wildShape.toLowerCase());
		let matchActor = (await gamePack.getDocument(match._id))?.toObject();
		const wildShapeActor = duplicate(matchActor);
		if (!wildShapeActor) return;
		const primalStrike = actor.items.find(i => i.name.includes("Primal Strike"));
		wildShapeActor.system.abilities.cha = actor.system.abilities.cha;
		wildShapeActor.system.abilities.int = actor.system.abilities.int;
		wildShapeActor.system.abilities.wis = actor.system.abilities.wis;
		wildShapeActor.system.attributes.prof = actor.system.attributes.prof;
		let sourceSkills = actor.system.skills;
		let targetSkills = wildShapeActor.system.skills;
		let skills = {};
		for (let i of Object.keys(sourceSkills)) {
			if (targetSkills[i].proficient > sourceSkills[i].proficient) skills[i] = {'value': targetSkills[i].proficient};
		}
		wildShapeActor.system.skills = skills;
		wildShapeActor.system.traits = {
			'size': wildShapeActor.system.traits.size
		};
		let wildShapeItems = {};
		[...wildShapeActor.items].forEach(i => { 
			if (primalStrike && i.type == "weapon") i.system.properties.mgc = true;
			wildShapeItems[i.name] = i; 
		});
		let wildShapeToken = {
			'name': wildShapeActor.name + ' (' + actor.name + ')',
			'texture': wildShapeActor.prototypeToken.texture,
			'width': wildShapeActor.prototypeToken.width,
			'height': wildShapeActor.prototypeToken.height
		}
		wildShapeActor.prototypeToken = wildShapeToken;
		wildShapeActor.name = wildShapeActor.name + ' (' + actor.name + ')';
		wildShapeActor.system.details.type.value = 'elemental';
		wildShapeActor.system.details.race = 'Elemental';
		delete wildShapeActor.system.details.alignment;
		delete wildShapeActor.token;
		delete wildShapeActor.effects;
		delete wildShapeActor.type;
		delete wildShapeActor.flags;
		delete wildShapeActor.folder;
		delete wildShapeActor.sort;
		delete wildShapeActor._id;
		delete wildShapeActor._stats;
		delete wildShapeActor.ownership;
		delete wildShapeActor.system.attributes.attunement;
		delete wildShapeActor.system.attributes.death;
		delete wildShapeActor.system.attributes.encumbrance;
		delete wildShapeActor.system.attributes.exhuastion;
		delete wildShapeActor.system.attributes.hd;
		delete wildShapeActor.system.attributes.init;
		delete wildShapeActor.system.attributes.inspiration;
		delete wildShapeActor.system.attributes.spellcasting;
		delete wildShapeActor.system.attributes.spelldc;
		delete wildShapeActor.system.bonuses;
		delete wildShapeActor.system.currency;
		delete wildShapeActor.system.scale;
		delete wildShapeActor.system.tools;
		delete wildShapeActor.system.spells;
		delete wildShapeActor.items;
		const updates = {
			token : wildShapeToken,
			actor: wildShapeActor,
			embedded: {
				Item: wildShapeItems,
			},
		}
		await warpgate.mutate(token.document, updates, {}, { name: "Wild Shape" });
	} else if (args[0] == "off") {
		await warpgate.revert(token.document, "Wild Shape");
	} else if (lastArg.macroPass == "preTargeting" && lastArg.item.type == "spell" && lastArg.item.system.school) {
		ui.notifications.warn("Unable to cast Spells while in Wild Shape");
        return false;
	}
} catch (err) {console.error("Elemental Wild Shape Macro - ", err)}