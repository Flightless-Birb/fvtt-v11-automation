try {
    const lastArg = args[args.length - 1];
    const tokenOrActor = await fromUuid(lastArg.actorUuid);
	const actor = tokenOrActor.actor ? tokenOrActor.actor : tokenOrActor;
    if (lastArg.macroPass == "postActiveEffects") {
        const equipped = actor.items.filter(i => i.type == "weapon" && i.system.equipped && ["simple","martial"].find(t => i.system.weaponType.toLowerCase().includes(t)));
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
            changes: [{ key: "macro.execute.GM", mode: 0, value: `Compendium.dnd-5e-core-compendium.macros.NtU35r1G39UGKK12 ${weaponId}`, priority: 20 }, { key: "ATL.light.dim", mode: 4, value: "40", priority: 20 }, { key: "ATL.light.bright", mode: 4, value: "20", priority: 20 }, { key: "ATL.light.color", mode: 5, value: "#ffffff", priority: 20 }, { key: "ATL.light.alpha", mode: 5, value: "0.1", priority: 20 }, { key: "ATL.light.animation", mode: 5, value: '{"type": "pulse", "speed": 3,"intensity": 1}', priority: 20 } ],
            duration: { seconds: 60 },
            origin: lastArg.uuid,
            disabled: false,
            isSuppressed: false
        }
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
    } else if (args[0] == "on") {
        const weapon = actor.items.find(i => i.id == args[1]); 
        if (weapon.flags["midi-qol"].tempSystem) await weapon.setFlag("midi-qol", "tempSystem", weapon.flags["midi-qol"].tempSystem.concat([{ source: "sacredWeapon", id: lastArg.efData._id, properties: ["mgc"], attackBonus: "@abilities.cha.mod" }]));
        if (!weapon.flags["midi-qol"].tempSystem) await weapon.setFlag("midi-qol", "tempSystem", [{ source: "core", id: weapon.id, system: JSON.parse(JSON.stringify(weapon.system)) }, { source: "sacredWeapon", id: lastArg.efData._id, properties: ["mgc"], attackBonus: "@abilities.cha.mod" }]); 
        await weapon.setFlag("midi-qol", "sacredWeapon", lastArg.efData._id);
        await weapon.update({
            name: weapon.name + " (Sacred Weapon)",
            system: { attackBonus: weapon.system.attackBonus + "+@abilities.cha.mod", properties: new Set([...weapon.system.properties].concat(["mgc"])).reduce((obj, str) => ({...obj, [str]: true}), {}) }
        });
    } else if (args[0] == "off") { 
        let weapon = actor.items.find(i => i.flags["midi-qol"].sacredWeapon == lastArg.efData._id);
        if (!weapon) weapon = game.actors.contents.find(a => a.items.find(i => i.flags["midi-qol"].sacredWeapon == lastArg.efData._id)).items.find(i => i.flags["midi-qol"].sacredWeapon == lastArg.efData._id);
		await weapon.setFlag("midi-qol", "tempSystem", weapon.flags["midi-qol"].tempSystem.filter(s => s.source != "sacredWeapon" && s.id != lastArg.efData._id));
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
                tempSystem.damage.parts[0][0] = tempSystem.damage.parts[0][0].replace(new RegExp(s.dieReplace[0]), s.dieReplace[1]);
                if (tempSystem.damage.versatile) tempSystem.damage.versatile = tempSystem.damage.versatile.replace(new RegExp(s.dieReplace[0]), s.dieReplace[1]);
            }
        });
        tempSystem.properties = tempSystem.properties.reduce((obj, str) => ({...obj, [str]: true}), {});
		await weapon.update({
			name: weapon.name.replace(" (Sacred Weapon)", ""),
			system: tempSystem
		});
		if (weapon.flags["midi-qol"].tempSystem.length < 2) weapon.unsetFlag("midi-qol", "tempSystem"); 
		weapon.unsetFlag("midi-qol", "sacredWeapon"); 
    } 
} catch (err) {console.error("Sacred Weapon Macro - ", err);}