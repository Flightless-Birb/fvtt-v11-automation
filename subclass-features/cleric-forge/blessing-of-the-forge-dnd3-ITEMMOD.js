try {
    const lastArg = args[args.length - 1];
    const tokenOrActor = await fromUuid(lastArg.actorUuid);
	const actor = tokenOrActor.actor ? tokenOrActor.actor : tokenOrActor;
    if (lastArg.macroPass == "postActiveEffects") {
        lastArg.targets.forEach(async target => {
            const equipped = target.actor.items.filter(i => !i.system?.properties?.has("mgc") && ((i?.type == "weapon" && ["simple","martial"].find(t => i.system?.type?.value?.toLowerCase()?.includes(t))) || (i?.type == "equipment" && i.system?.armor?.value && !["natural", "shield"].includes(i.system?.type?.value?.toLowerCase()))));
            if (equipped.length) {
                let weaponOrArmorContent = "";
                equipped.forEach((weaponOrArmor) => { weaponOrArmorContent += `<label class="radio-label"><input type="radio" name="weaponOrArmor" value="${weaponOrArmor.id}"><img src="${weaponOrArmor.img}" style="border:0px; width: 50px; height:50px;">${weaponOrArmor.name}</label>`; });
                const content = `
                    <style>
                    .weaponOrArmor .form-group { display: flex; flex-wrap: wrap; width: 100%; align-items: flex-start; }
                    .weaponOrArmor .radio-label { display: flex; flex-direction: column; align-items: center; text-align: center; justify-items: center; flex: 1 0 25%; line-height: normal; }
                    .weaponOrArmor .radio-label input { display: none; }
                    .weaponOrArmor img { border: 0px; width: 50px; height: 50px; flex: 0 0 50px; cursor: pointer; }
                    .weaponOrArmor [type=radio]:checked + img { outline: 2px solid #f00; }
                    </style>
                    <div style="display: flex; flex-direction: row; align-items: center; text-align: center; justify-content: center;">
                        <p>Targeting: </p>
                        <img id=${target.id} src="${target.texture.src ?? target.document.texture.src}" style="border: 0px; width 50px; height: 50px;">
                    </div>
                    <form class="weaponOrArmor">
                    <div class="form-group" id="weaponOrArmors">
                        ${weaponOrArmorContent}
                    </div>
                    </form>
					<script>
						$("img").mouseover(function(e) {
							if (!e.target.id) return;
							let targetToken = canvas.tokens.get(e.target.id);
							targetToken.hover = true;
							targetToken.refresh();
						});
						$("img").mouseout(function(e) {
							if (!e.target.id) return;
							let targetToken = canvas.tokens.get(e.target.id);
							targetToken.hover = false;
							targetToken.refresh();
						});
					</script>
                `;
                let dialog = await new Promise((resolve) => {
					new Dialog({
						title: "Blessing of the Forge: Choose an Item",
						content,
						buttons: {
							Confirm: {
								label: "Confirm",
								icon: '<i class="fas fa-check"></i>',
								callback: async () => {resolve($("input[type='radio'][name='weaponOrArmor']:checked").val())},
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
				let itemId = await dialog;
				if (!itemId) return;
				const effectData = {
					name: "Blessing of the Forge",
					icon: lastArg.item.img,
					changes: [{ key: "macro.execute.GM", mode: 0, value: `Compendium.dnd-5e-core-compendium.macros.fjMpD92HT5hOjThS ${itemId} ${target.actor.uuid}`, priority: 20 }],
					flags: { dae: { specialDuration: ["longRest"] } },
					origin: lastArg.item.uuid,
					disabled: false,
					isSuppressed: false
				}
				await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
            }
        });
    } else if (args[0] == "on") {
		const targetTokenOrActor = await fromUuid(args[2]);
		const targetActor = targetTokenOrActor.actor ? targetTokenOrActor.actor : targetTokenOrActor;
        const weaponOrArmor = targetActor.items.find(i => i.id == args[1]); 
        if (weaponOrArmor.type == "weapon") {
            if (weaponOrArmor.flags["midi-qol"].tempSystem) { 
                await weaponOrArmor.setFlag("midi-qol", "tempSystem", weaponOrArmor.flags["midi-qol"].tempSystem.concat([{ source: "blessingOfTheForge", id: lastArg.efData._id, properties: ["mgc"], attackBonus: 1, damageBonus: [[1, ""]]  }]));
            }
            if (!weaponOrArmor.flags["midi-qol"].tempSystem) { 
                await weaponOrArmor.setFlag("midi-qol", "tempSystem", [{ source: "core", id: weaponOrArmor.id, system: JSON.parse(JSON.stringify(weaponOrArmor.system)) }, { source: "blessingOfTheForge", id: lastArg.efData._id, properties: ["mgc"], attackBonus: 1, damageBonus: [[1, ""]] }]); 
            }
            await weaponOrArmor.setFlag("midi-qol", "blessingOfTheForge", lastArg.efData._id);
            await weaponOrArmor.update({
                name: weaponOrArmor.name + " (Blessing of the Forge)",
                system: { attackBonus: weaponOrArmor.system.attackBonus + "+1", properties: new Set([...weaponOrArmor.system.properties].concat(["mgc"])).reduce((obj, str) => ({...obj, [str]: true}), {}), "damage.parts": weaponOrArmor.system.damage.parts.concat([[1, ""]]), "damage.versatile": weaponOrArmor.system.damage.versatile + "+1" }
            });
        } else if (weaponOrArmor.type == "equipment") {
            if (weaponOrArmor.flags["midi-qol"].tempSystem) { 
                await weaponOrArmor.setFlag("midi-qol", "tempSystem", weaponOrArmor.flags["midi-qol"].tempSystem.concat([{ source: "blessingOfTheForge", id: lastArg.efData._id, properties: ["mgc"], acBonus: 1 }]));
            }
            if (!weaponOrArmor.flags["midi-qol"].tempSystem) { 
                await weaponOrArmor.setFlag("midi-qol", "tempSystem", [{ source: "core", id: weaponOrArmor.id, system: JSON.parse(JSON.stringify(weaponOrArmor.system)) }, { source: "blessingOfTheForge", id: lastArg.efData._id, properties: ["mgc"], acBonus: 1 }]); 
            }
            await weaponOrArmor.setFlag("midi-qol", "blessingOfTheForge", lastArg.efData._id);
            await weaponOrArmor.update({
                name: weaponOrArmor.name + " (Blessing of the Forge)",
                system: { armor: { value: weaponOrArmor.system.armor.value + 1 }, properties: Array.from(new Set([...weaponOrArmor.system.properties].concat(["mgc"]))) }
            });
        }
    } else if (args[0] == "off") { 
		const targetTokenOrActor = await fromUuid(args[2]);
		const targetActor = targetTokenOrActor.actor ? targetTokenOrActor.actor : targetTokenOrActor;
        let weaponOrArmor = targetActor.items.find(i => i.flags["midi-qol"].blessingOfTheForge == lastArg.efData._id);
        if (!weaponOrArmor) weaponOrArmor = game.actors.contents.find(a => a.items.find(i => i.flags["midi-qol"].blessingOfTheForge == lastArg.efData._id)).items.find(i => i.flags["midi-qol"].blessingOfTheForge == lastArg.efData._id);
		await weaponOrArmor.setFlag("midi-qol", "tempSystem", weaponOrArmor.flags["midi-qol"].tempSystem.filter(s => s.source != "blessingOfTheForge" && s.id != lastArg.efData._id));
		const tempSystem = JSON.parse(JSON.stringify(weaponOrArmor.flags["midi-qol"].tempSystem.find(s => s.source == "core").system)); 
        if (weaponOrArmor.type == "weapon") {
            weaponOrArmor.flags["midi-qol"].tempSystem.filter(s => s.source != "core").forEach(s => {
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
            await weaponOrArmor.update({
                name: weaponOrArmor.name.replace(" (Blessing of the Forge)", ""),
                system: tempSystem
            });
            if (weaponOrArmor.flags["midi-qol"].tempSystem.length < 2) weaponOrArmor.unsetFlag("midi-qol", "tempSystem"); 
            weaponOrArmor.unsetFlag("midi-qol", "blessingOfTheForge");
        } else if (weaponOrArmor.type == "equipment") {
            weaponOrArmor.flags["midi-qol"].tempSystem.filter(s => s.source != "core").forEach(s => {
                if (s.properties) tempSystem.properties = new Set([...tempSystem.properties].concat(s.properties));
                if (s.acBonus) tempSystem.armor.value = tempSystem.armor.value + s.acBonus;
            });
			tempSystem.properties = Array.from(tempSystem.properties);
            await weaponOrArmor.update({
                name: weaponOrArmor.name.replace(" (Blessing of the Forge)", ""),
                system: tempSystem
            });
            if (weaponOrArmor.flags["midi-qol"].tempSystem.length < 2) weaponOrArmor.unsetFlag("midi-qol", "tempSystem"); 
            weaponOrArmor.unsetFlag("midi-qol", "blessingOfTheForge");
        } 
    } 
} catch (err) {console.error("Blessing of the Forge Macro - ", err);}