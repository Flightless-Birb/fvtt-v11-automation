try {
	const lastArg = args[args.length - 1];
	const token = canvas.tokens.get(lastArg.tokenId);
	const tokenOrActor = await fromUuid(lastArg.actorUuid);
	const actor = tokenOrActor.actor ? tokenOrActor.actor : tokenOrActor;
	const druidLevels = actor.classes.druid?.system?.levels ?? 2;
	if (lastArg.macroPass == "postActiveEffects" && !warpgate.mutationStack(token.document).getName("Wild Shape")) {
		let maxCR = druidLevels > 7 ? 1 : druidLevels > 3 ? 0.5 : 0.25;
        const maxFly = druidLevels > 7 ? 99 : 0;
        const maxSwim = druidLevels > 3 ? 99 : 0;
        const circleForms = actor.items.find(i => i.name.includes("Circle Forms"));
        if (circleForms) maxCR = druidLevels > 5 ? Math.floor(druidLevels / 3) : 1;
		const beasts = [
			{ name: "Ape", cr: 0.5, fly: 0, swim: 0 },
			{ name: "Axe Beak", cr: 0.25, fly: 0, swim: 0 },
			{ name: "Baboon", cr: 0, fly: 0, swim: 0 },
			{ name: "Bat", cr: 0, fly: 30, swim: 0 },
			{ name: "Black Bear", cr: 0.5, fly: 0, swim: 0 },
			{ name: "Blood Hawk", cr: 0.125, fly: 60, swim: 0 },
			{ name: "Boar", cr: 0.25, fly: 0, swim: 0 },
			{ name: "Brown Bear", cr: 1, fly: 0, swim: 0 },
			{ name: "Camel", cr: 0.125, fly: 0, swim: 0 },
			{ name: "Cat", cr: 0, fly: 0, swim: 0 },
			{ name: "Constrictor Snake", cr: 0.25, fly: 0, swim: 30 },
			{ name: "Crab", cr: 0, fly: 0, swim: 20 },
			{ name: "Crocodile", cr: 0.5, fly: 0, swim: 30 },
			{ name: "Deer", cr: 0, fly: 0, swim: 0 },
			{ name: "Dire Wolf", cr: 1, fly: 0, swim: 0 },
			{ name: "Draft Horse", cr: 0.25, fly: 0, swim: 0 },
			{ name: "Eagle", cr: 0, fly: 60, swim: 0 },
			{ name: "Elephant", cr: 4, fly: 0, swim: 0 },
			{ name: "Frog", cr: 0, fly: 0, swim: 20 },
			{ name: "Giant Ape", cr: 7, fly: 0, swim: 0 },
			{ name: "Giant Bat", cr: 0.25, fly: 60, swim: 0 },
			{ name: "Giant Boar", cr: 2, fly: 0, swim: 0 },
			{ name: "Giant Centipede", cr: 0.25, fly: 0, swim: 0 },
			{ name: "Giant Constrictor Snake", cr: 2, fly: 0, swim: 30 },
			{ name: "Giant Crab", cr: 0.125, fly: 0, swim: 30 },
			{ name: "Giant Crocodile", cr: 5, fly: 0, swim: 50 },
			{ name: "Giant Eagle", cr: 1, fly: 80, swim: 0 },
			{ name: "Giant Frog", cr: 0.25, fly: 0, swim: 30 },
			{ name: "Giant Hyena", cr: 1, fly: 0, swim: 0 },
			{ name: "Giant Lizard", cr: 0.25, fly: 0, swim: 0 },
			{ name: "Giant Owl", cr: 0.25, fly: 60, swim: 0 },
			{ name: "Giant Poisonous Snake", cr: 0.25, fly: 0, swim: 30 },
			{ name: "Giant Rat", cr: 0.125, fly: 0, swim: 0 },
			{ name: "Giant Scorpion", cr: 3, fly: 0, swim: 0 },
			{ name: "Giant Shark", cr: 5, fly: 0, swim: 50 },
			{ name: "Giant Spider", cr: 1, fly: 0, swim: 0 },
			{ name: "Giant Vulture", cr: 1, fly: 60, swim: 0 },
			{ name: "Giant Wasp", cr: 0.5, fly: 50, swim: 0 },
			{ name: "Giant Weasel", cr: 0.125, fly: 0, swim: 0 },
			{ name: "Giant Wolf Spider", cr: 0.25, fly: 0, swim: 0 },
			{ name: "Hawk", cr: 0, fly: 60, swim: 0 },
			{ name: "Hunter Shark", cr: 2, fly: 0, swim: 40 },
			{ name: "Hyena", cr: 0, fly: 0, swim: 0 },
			{ name: "Jackal", cr: 0, fly: 0, swim: 0 },
			{ name: "Killer Whale", cr: 3, fly: 0, swim: 60 },
			{ name: "Lion", cr: 1, fly: 0, swim: 0 },
			{ name: "Lizard", cr: 0, fly: 0, swim: 0 },
			{ name: "Mammoth", cr: 6, fly: 0, swim: 0 },
			{ name: "Mastiff", cr: 0.125, fly: 0, swim: 0 },
			{ name: "Mule", cr: 0.125, fly: 0, swim: 0 },
			{ name: "Owl", cr: 0, fly: 60, swim: 0 },
			{ name: "Panther", cr: 0.25, fly: 0, swim: 0 },
			{ name: "Poisonous Snake", cr: 0.125, fly: 0, swim: 30 },
			{ name: "Polar Bear", cr: 2, fly: 0, swim: 30 },
			{ name: "Pony", cr: 0.125, fly: 0, swim: 0 },
			{ name: "Rat", cr: 0, fly: 0, swim: 0 },
			{ name: "Raven", cr: 0, fly: 50, swim: 0 },
			{ name: "Reef Shark", cr: 0.5, fly: 0, swim: 40 },
			{ name: "Riding Horse", cr: 0.25, fly: 0, swim: 0 },
			{ name: "Saber-Toothed Tiger", cr: 2, fly: 0, swim: 0 },
			{ name: "Scorpion", cr: 0, fly: 0, swim: 0 },
			{ name: "Spider", cr: 0, fly: 0, swim: 0 },
			{ name: "Stirge", cr: 0.125, fly: 40, swim: 0 },
			{ name: "Tiger", cr: 1, fly: 0, swim: 0 },
			{ name: "Turtle", cr: 0, fly: null, swim: 10 },
			{ name: "Vulture", cr: 0, fly: 50, swim: 0 },
			{ name: "Warhorse", cr: 0.5, fly: 0, swim: 0 },
			{ name: "Weasel", cr: 0, fly: 0, swim: 0 },
			{ name: "Wolf", cr: 0.25, fly: 0, swim: 0 }
		];
		const validBeasts = beasts.filter(b => maxCR >= b.cr && maxFly >= b.fly && maxSwim >= b.swim);
		const beastOptions = validBeasts.reduce((acc, target) => acc += `<option value="${target.name}">${target.name} (CR ${target.cr >= 1 || target.cr == 0 ? target.cr : `1/${1/target.cr}`})</option>`, "");
		let dialog = new Promise((resolve) => {
			new Dialog({
			title: "Wild Shape",
			content: `
			<div style="display: flex; flex-direction: row; align-items: center; text-align: center; justify-content: center;">
				<p>Choose a beast form to wild shape into.</p>
			</div>
			<form>
				<div style="display: flex; flex-direction: row; align-items: center; text-align: center; justify-content: center;">
					<label for="beast">Beast:</label><select id="beast">${beastOptions}</select>
				</div>
			</form>
			`,
			buttons: {
				confirm: {
					icon: '<i class="fas fa-check"></i>',
					label: "Confirm",
					callback: () => resolve($("#beast")[0].value)
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
			changes: [{ key: "macro.execute", mode: 0, value: "Compendium.dnd-5e-core-compendium.macros.JkyTgU1gtkh1NuVJ", priority: 20 }],
			flags: { "midi-qol": { wildShape: wildShapeChoice } },
			duration: { seconds: Math.min(druidLevels / 2) * 3600 },
			icon: "icons/creatures/mammals/elk-moose-marked-green.webp",
			name: "Wild Shape",
			origin: lastArg.item.uuid
		}
		if (druidLevels < 20) effectData.changes.push({ key: "flags.midi-qol.onUseMacroName", mode: 0, value: "Compendium.dnd-5e-core-compendium.macros.utRCmQJmdbWw5B2i, preTargeting", priority: 20 }); 
		await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] }); 
	} else if (args[0] == "on" && lastArg.efData.flags?.["midi-qol"]?.wildShape) {
		const gamePack = game.packs.get("dnd-5e-core-compendium.monsters");
		let packIndex = await gamePack.getIndex({'fields': ['name', 'type', 'folder']});
		let match = packIndex.find(a => a.name.toLowerCase() == lastArg.efData.flags?.["midi-qol"]?.wildShape.toLowerCase());
		let matchActor = (await gamePack.getDocument(match._id))?.toObject();
		const wildShapeActor = duplicate(matchActor);
		if (!wildShapeActor) return;
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
		[...wildShapeActor.items].forEach(i => { wildShapeItems[i.name] = i });
		let wildShapeToken = {
			'name': wildShapeActor.name + ' (' + actor.name + ')',
			'texture': wildShapeActor.prototypeToken.texture,
			'width': wildShapeActor.prototypeToken.width,
			'height': wildShapeActor.prototypeToken.height
		}
		wildShapeActor.prototypeToken = wildShapeToken;
		wildShapeActor.name = wildShapeActor.name + ' (' + actor.name + ')';
		wildShapeActor.system.details.type.value = 'beast';
		wildShapeActor.system.details.race = 'Beast';
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
	} 
} catch (err) {console.error("Wild Shape Macro - ", err)}