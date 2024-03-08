try {
    const lastArg = args[args.length - 1];
    const tokenOrActor = await fromUuid(lastArg.actorUuid);
	const actor = tokenOrActor.actor ? tokenOrActor.actor : tokenOrActor;
    if (args[0] == "on") {
        const equipped = actor.items.filter(i => i.type == "weapon" && !i.system.properties.two && (actor.system.traits.weaponProf.value.has(i.system.type.baseItem) || (actor.system.traits.weaponProf.value.has("sim") && i.system.type.value.toLowerCase().includes("simple")) || (actor.system.traits.weaponProf.value.has("mar") && i.system.type.value.toLowerCase().includes("martial"))));
        if (!equipped.length) {
            ui.notifications.warn("No Valid Weapons Equipped");
            return;
        }
        let weaponContent = "";
        equipped.forEach((weapon) => { weaponContent += `<label class="radio-label"><input type="radio" name="weapon" value="${weapon.id}"><img src="${weapon.img}" style="border:0px; width: 50px; height:50px;">${weapon.name}</label>`; });
        const content = `
            <style>
            .weapon .form-group { display: flex; flex-wrap: wrap; width: 100%; align-items: flex-start; }
            .weapon .radio-label { display: flex; flex-direction: column; align-items: center; text-align: center; justify-items: center; flex: 1 0 25%; line-height: normal; }
            .weapon .radio-label input { display: none; }
            .weapon img { border: 0px; width: 50px; height: 50px; flex: 0 0 50px; cursor: pointer; }
            .weapon [type=radio]:checked + img { outline: 2px solid #f00; }
            </style>
            <form class="weapon">
                <div class="form-group" id="weapons">
                    ${weaponContent}
                </div>
            </form>
        `;
        let dialog = equipped.length == 1 ? equipped[0].id : new Promise((resolve) => {
            new Dialog({
                title: "Hex Warrior: Choose a weapon",
                content,
                buttons: {
					Confirm: {
						label: "Confirm",
                        icon: '<i class="fas fa-check"></i>',
						callback: async () => {resolve($("input[type='radio'][name='weapon']:checked").val())},
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
        let weaponId = await dialog;
        if (!weaponId) return;
        const effectData = {
            name: lastArg.item.name,
            icon: lastArg.item.img,
            changes: [{ key: "macro.execute.GM", mode: 0, value: `Compendium.dnd-5e-core-compendium.macros.NtU35r1G39UGKK12 ${weaponId}`, priority: 20 }],
            duration: { seconds: 60 },
            origin: lastArg.uuid,
            disabled: false,
            isSuppressed: false
        }
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
    } else if (args[0] == "on") { 
        const weapon = actor.items.find(i => i.id == args[1]); 
        if (weapon.flags["midi-qol"].tempSystem) await weapon.setFlag("midi-qol", "tempSystem", weapon.flags["midi-qol"].tempSystem.concat([{ source: "hexWeapon", id: lastArg.efData._id, system: { ability: "cha" } }]));
        if (!weapon.flags["midi-qol"].tempSystem) await weapon.setFlag("midi-qol", "tempSystem", [{ source: "core", id: weapon.id, system: JSON.parse(JSON.stringify(weapon.system)) }, { source: "hexWeapon", id: lastArg.efData._id, ability: "cha" }]); 
        await weapon.setFlag("midi-qol", "hexWarrior", lastArg.efData._id);
        await weapon.update({
            name: weapon.name + " (Hex Weapon)",
            system: { ability: "cha" }
        });
    } else if (args[0] == "off") { 
        let weapon = actor.items.find(i => i.flags["midi-qol"].hexWarrior == lastArg.efData._id);
        if (!weapon) weapon = game.actors.contents.find(a => a.items.find(i => i.flags["midi-qol"].hexWarrior == lastArg.efData._id)).items.find(i => i.flags["midi-qol"].hexWarrior == lastArg.efData._id);
		await weapon.setFlag("midi-qol", "tempSystem", weapon.flags["midi-qol"].tempSystem.filter(s => s.source != "hexWarrior" && s.id != lastArg.efData._id));
		const tempSystem = JSON.parse(JSON.stringify(weapon.flags["midi-qol"].tempSystem.find(s => s.source == "core").system)); 
		weapon.flags["midi-qol"].tempSystem.filter(s => s.source != "core").forEach(s => {
            if (s.properties) tempSystem.properties = new Set([...tempSystem.properties].concat(s.properties));
            if (s.ability) tempSystem.ability = s.ability;
            if (s.range) tempSystem.range = s.range;
            if (s.attackBonus) tempSystem.attackBonus = tempSystem.attackBonus + "+" + s.attackBonus;
            if (s.damageBonus) {
                tempSystem.damage.parts = tempSystem.damage.parts.concat(s.damageBonus);
                if (tempSystem.damage.versatile) s.damageBonus.forEach(p => tempSystem.damage.versatile = tempSystem.damage.versatile + "+" + `${p[0]}` + (p[1] ? `[${p[1]}]` : ""));
            }
            if (s.dieReplace) {
                tempSystem.damage.parts[0][0].replace(new RegExp(s.dieReplace[0]), s.dieReplace[1]);
                if (tempSystem.damage.versatile) tempSystem.damage.versatile = tempSystem.damage.versatile.replace(new RegExp(s.dieReplace[0]), s.dieReplace[1]);
            }
        });
        tempSystem.properties = tempSystem.properties.reduce((obj, str) => ({...obj, [str]: true}), {});
		await weapon.update({
			name: weapon.name.replace(" (Hex Weapon)", ""),
			system: tempSystem
		});
		if (weapon.flags["midi-qol"].tempSystem.length < 2) weapon.unsetFlag("midi-qol", "tempSystem"); 
		weapon.unsetFlag("midi-qol", "hexWarrior"); 
    } 
} catch (err) {console.error("Hex Warrior Macro - ", err);}