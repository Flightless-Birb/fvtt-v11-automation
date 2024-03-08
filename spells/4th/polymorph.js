try {
	const lastArg = args[args.length - 1];
	const token = canvas.tokens.get(lastArg.tokenId);
	const tokenOrActor = await fromUuid(lastArg.actorUuid);
	const actor = tokenOrActor.actor ? tokenOrActor.actor : tokenOrActor;
	if (lastArg.macroPass == "postActiveEffects") {
        lastArg.targets.filter(t => lastArg.failedSaves.includes(t) || t.actor.uuid == actor.uuid).forEach(async (t) => { 
			if (!t.actor || !MidiQOL.typeOrRace(t.actor) || MidiQOL.typeOrRace(t.actor).toLowerCase().includes("shapechanger") || t.actor.system.details.type.subtype.toLowerCase().includes("shapechanger") || t.actor.system.attributes.hp.value < 1 || t.actor.system.traits.ci.custom.toLowerCase().includes("form altering")) return;
			const beasts = [
				{ name: "Ape", cr: 0.5 },
				{ name: "Axe Beak", cr: 0.25 },
				{ name: "Baboon", cr: 0 },
				{ name: "Bat", cr: 0 },
				{ name: "Black Bear", cr: 0.5 },
				{ name: "Blood Hawk", cr: 0.125 },
				{ name: "Boar", cr: 0.25 },
				{ name: "Brown Bear", cr: 1 },
				{ name: "Camel", cr: 0.125 },
				{ name: "Cat", cr: 0 },
				{ name: "Constrictor Snake", cr: 0.25 },
				{ name: "Crab", cr: 0 },
				{ name: "Crocodile", cr: 0.5 },
				{ name: "Deer", cr: 0 },
				{ name: "Dire Wolf", cr: 1 },
				{ name: "Draft Horse", cr: 0.25 },
				{ name: "Eagle", cr: 0 },
				{ name: "Elephant", cr: 4 },
				{ name: "Frog", cr: 0 },
				{ name: "Giant Ape", cr: 7 },
				{ name: "Giant Bat", cr: 0.25 },
				{ name: "Giant Boar", cr: 2 },
				{ name: "Giant Centipede", cr: 0.25 },
				{ name: "Giant Constrictor Snake", cr: 2 },
				{ name: "Giant Crab", cr: 0.125 },
				{ name: "Giant Crocodile", cr: 5 },
				{ name: "Giant Eagle", cr: 1 },
				{ name: "Giant Frog", cr: 0.25 },
				{ name: "Giant Hyena", cr: 1 },
				{ name: "Giant Lizard", cr: 0.25 },
				{ name: "Giant Owl", cr: 0.25 },
				{ name: "Giant Poisonous Snake", cr: 0.25 },
				{ name: "Giant Rat", cr: 0.125 },
				{ name: "Giant Scorpion", cr: 3 },
				{ name: "Giant Shark", cr: 5 },
				{ name: "Giant Spider", cr: 1 },
				{ name: "Giant Vulture", cr: 1 },
				{ name: "Giant Wasp", cr: 0.5 },
				{ name: "Giant Weasel", cr: 0.125 },
				{ name: "Giant Wolf Spider", cr: 0.25 },
				{ name: "Hawk", cr: 0 },
				{ name: "Hunter Shark", cr: 2 },
				{ name: "Hyena", cr: 0 },
				{ name: "Jackal", cr: 0 },
				{ name: "Killer Whale", cr: 3 },
				{ name: "Lion", cr: 1 },
				{ name: "Lizard", cr: 0 },
				{ name: "Mammoth", cr: 6 },
				{ name: "Mastiff", cr: 0.125 },
				{ name: "Mule", cr: 0.125 },
				{ name: "Owl", cr: 0 },
				{ name: "Panther", cr: 0.25 },
				{ name: "Poisonous Snake", cr: 0.125 },
				{ name: "Polar Bear", cr: 2 },
				{ name: "Pony", cr: 0.125 },
				{ name: "Rat", cr: 0 },
				{ name: "Raven", cr: 0 },
				{ name: "Reef Shark", cr: 0.5 },
				{ name: "Riding Horse", cr: 0.25 },
				{ name: "Saber-Toothed Tiger", cr: 2 },
				{ name: "Scorpion", cr: 0 },
				{ name: "Spider", cr: 0 },
				{ name: "Stirge", cr: 0.125 },
				{ name: "Tiger", cr: 1 },
				{ name: "Turtle", cr: 0 },
				{ name: "Vulture", cr: 0 },
				{ name: "Warhorse", cr: 0.5 },
				{ name: "Weasel", cr: 0 },
				{ name: "Wolf", cr: 0.25 }
			];
			const validBeasts = beasts.filter(b => t.actor.system.details?.level ?? t.actor.system.details?.cr >= b.cr);
			const beastOptions = validBeasts.reduce((acc, target) => acc += `<option value="${target.name}">${target.name} (CR ${target.cr >= 1 || target.cr == 0 ? target.cr : `1/${1/target.cr}`})</option>`, "");
			let dialog = new Promise((resolve) => {
				new Dialog({
				title: "Polymorph",
				content: `
				<div style="display: flex; flex-direction: row; align-items: center; text-align: center; justify-content: center;">
					<p>Choose a beast to polymorph the target into.</p>
				</div>
				<div style="display: flex; flex-direction: row; align-items: center; text-align: center; justify-content: center;">
					<p>Targeting: </p>
					<img id="${t.id}" src="${t.texture.src ?? t.document.texture.src}" style="border: 0px; width 50px; height: 50px;">
				</div>
				<form>
					<div style="display: flex; flex-direction: row; align-items: center; text-align: center; justify-content: center;">
						<label for="beast">Beast:</label><select id="beast">${beastOptions}</select>
					</div>
				</form>
				<script>
					$("img").mouseover(function(e) {
						let targetToken = canvas.tokens.get(e.target.id);
						targetToken.hover = true;
						targetToken.refresh();
					});
					$("img").mouseout(function(e) {
						let targetToken = canvas.tokens.get(e.target.id);
						targetToken.hover = false;
						targetToken.refresh();
					});
				</script>
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
			let polymorphChoice = await dialog;
			if (!polymorphChoice) return;
			const effectData = {
				disabled: false,
				changes: [{ key: "macro.execute", mode: 0, value: "Compendium.dnd-5e-core-compendium.macros.nrLODrNmniqkBv9c", priority: 20 }, { key: "flags.midi-qol.onUseMacroName", mode: 0, value: "Compendium.dnd-5e-core-compendium.macros.nrLODrNmniqkBv9c, preTargeting", priority: 20 }, { key: "flags.midi-qol.disableFeats", mode: 0, value: "1", priority: 20 }],
				flags: { "midi-qol": { polymorph: polymorphChoice } },
				duration: { seconds: 60 },
				icon: "icons/magic/control/energy-stream-link-large-teal.webp",
				name: "Polymorph",
				origin: lastArg.item.uuid
			}
			await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: t.actor.uuid, effects: [effectData] }); 
		});
	} else if (args[0] == "on" && lastArg.efData.flags?.["midi-qol"]?.polymorph) {
		const gamePack = game.packs.get("dnd-5e-core-compendium.monsters");
		let packIndex = await gamePack.getIndex({'fields': ['name', 'type', 'folder']});
		let match = packIndex.find(a => a.name.toLowerCase() == lastArg.efData.flags?.["midi-qol"]?.polymorph.toLowerCase());
		let matchActor = (await gamePack.getDocument(match._id))?.toObject();
		const polymorphActor = duplicate(matchActor);
		if (!polymorphActor) return;
		let polymorphItems = {};
		[...actor.items].forEach(i => { if (!["class", "subclass", "race", "background", "feat", "spell"].includes(i.type)) polymorphItems[i.name] = warpgate.CONST.DELETE });
		[...polymorphActor.items].forEach(i => { 
			i.flags.polymorph = true;
			polymorphItems[i.name] = i; 
		});
		let polymorphEffects = {};
		let polymorphToken = {
			'name': polymorphActor.name + ' (' + actor.name + ')',
			'texture': polymorphActor.prototypeToken.texture,
			'width': polymorphActor.prototypeToken.width,
			'height': polymorphActor.prototypeToken.height
		}
		polymorphActor.prototypeToken = polymorphToken;
		polymorphActor.name = polymorphActor.name + ' (' + actor.name + ')';
		polymorphActor.system.details.type.value = 'beast';
		polymorphActor.system.details.race = 'Beast';
		delete polymorphActor.system.details.alignment;
		delete polymorphActor.token;
		delete polymorphActor.effects;
		delete polymorphActor.type;
		delete polymorphActor.flags;
		delete polymorphActor.folder;
		delete polymorphActor.sort;
		delete polymorphActor._id;
		delete polymorphActor._stats;
		delete polymorphActor.ownership;
		delete polymorphActor.system.attributes.attunement;
		delete polymorphActor.system.attributes.death;
		delete polymorphActor.system.attributes.encumbrance;
		delete polymorphActor.system.attributes.exhuastion;
		delete polymorphActor.system.attributes.hd;
		delete polymorphActor.system.attributes.init;
		delete polymorphActor.system.attributes.inspiration;
		delete polymorphActor.system.attributes.spellcasting;
		delete polymorphActor.system.attributes.spelldc;
		delete polymorphActor.system.bonuses;
		delete polymorphActor.system.currency;
		delete polymorphActor.system.scale;
		delete polymorphActor.system.tools;
		delete polymorphActor.system.spells;
		delete polymorphActor.items;
		const updates = {
			token : polymorphToken,
			actor: polymorphActor,
			embedded: {
				Item: polymorphItems,
				ActiveEffect: polymorphEffects,
			},
		}
		console.error(updates);
		await warpgate.mutate(token.document, updates, {}, { name: "Polymorph" });
		[...actor.effects].forEach(async e => { 
			let parent = await fromUuid(e.origin);
			if (["class", "subclass", "race", "background", "feat", "spell"].includes(parent.type) && (e.transfer || e.flags.dae.transfer) && !e.disabled) e.update({ disabled: true });
		});
	} else if (args[0] == "off") {
		await warpgate.revert(token.document, "Polymorph");
		if (!actor.flags?.["midi-qol"]?.disableFeats) [...actor.effects].forEach(async e => { 
			let parent = await fromUuid(e.origin);
			if (["class", "subclass", "race", "background", "feat", "spell"].includes(parent.type) && (e.transfer || e.flags.dae.transfer) && e.disabled) e.update({ disabled: false });
		});
	} else if (lastArg.macroPass == "preTargeting" && !lastArg.item.flags?.polymorph) {
		ui.notifications.warn("Unable to cast Spells or use Features while Polymorphed");
        return false;
	}
} catch (err) {console.error("Polymorph Macro - ", err)}