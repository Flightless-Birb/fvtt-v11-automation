try {
    const lastArg = args[args.length - 1];
    const tokenOrActor = await fromUuid(lastArg.actorUuid);
	const actor = tokenOrActor.actor ? tokenOrActor.actor : tokenOrActor;
    if (lastArg.macroPass == "preActiveEffects" && lastArg.item.effects.find(e => e.name == "Rage")) {
        let createHook = Hooks.on("createActiveEffect", async (effect) => {
            if (effect.name == "Rage" && effect.parent.uuid == lastArg.actor.uuid) {
                let effectHook = Hooks.on("midi-qol.RollComplete", async (workflowNext) => {
                    if (lastArg.uuid == workflowNext.uuid) {
                        const changes = lastArg.actor.effects.find(e => e.id == effect.id).changes;
                        const effectData = {
                            changes: [{ key: "macro.execute", mode: 0, value: "Compendium.dnd-5e-core-compendium.macros.bDqrPWLXLY5kURuQ", priority: 20 }, { key: "flags.midi-qol.onUseMacroName", mode: 0, value: "Compendium.dnd-5e-core-compendium.macros.bDqrPWLXLY5kURuQ, preDamageRollStarted", priority: 20 }],
                            disabled: false,
                            name: "Elemental Cleaver Infusion",
                            icon: "icons/weapons/axes/axe-battle-elemental-lava.webp",
                            duration: { seconds: 60 }
                        }
                        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: lastArg.actor.uuid, effects: [effectData] });
                        const damageEffect = lastArg.actor.effects.find(e => e.name == "Elemental Cleaver Infusion");
                        if (damageEffect) await MidiQOL.socket().executeAsGM("updateEffects", { actorUuid: lastArg.actor.uuid, updates: [{ _id: effect.id, changes: changes.concat([{ key: "flags.dae.deleteUuid", mode: 5, value: damageEffect.uuid, priority: 20 }]) }] });
                        Hooks.off("midi-qol.RollComplete", effectHook);
                    }
                });
                Hooks.off("createActiveEffect", createHook);
            }
        });
    } else if (lastArg.macroPass == "postDamageRollStarted" && lastArg.actor.flags?.["midi-qol"]?.elementalCleaver && lastArg.item.flags?.["midi-qol"]?.elementalCleaver) {
        let type = lastArg.actor.flags?.["midi-qol"]?.elementalCleaver;
        let newDamageRolls = workflowNext.damageRolls;
        let newBonusDamageRolls = workflowNext.bonusDamageRolls;
        newDamageRolls.forEach(async r => {
            r.terms.forEach(t => { 
                if (t.options.flavor && (t.options.flavor.toLowerCase() != args[0].item.system.damage.parts[0][1].toLowerCase())) return;
                t.formula.replace(t.options.flavor, type);
                t.options.flavor = type;
            });
        });
        newBonusDamageRolls.forEach(async r => {
            r.terms.forEach(t => { 
                if (t.options.flavor && (t.options.flavor.toLowerCase() != args[0].item.system.damage.parts[0][1].toLowerCase())) return;
                t.formula.replace(t.options.flavor, type);
                t.options.flavor = type;
            });
        });
        if (newDamageRolls) await workflowNext.setDamageRolls(newDamageRolls);
        if (newBonusDamageRolls) await workflowNext.setBonusDamageRolls(newBonusDamageRolls);
    } else if (args[0] === "on") {
        const equipped = actor.items.filter(i => i.type === "weapon" && i.system.actionType === "mwak" && i.system.equipped && ["simple","martial"].find(t => i.system.weaponType.toLowerCase().includes(t)));
        let weaponContent = "";
        equipped.forEach((weapon) => { weaponContent += `<label class="radio-label"><input type="radio" name="weapon" value="${weapon.id}"><img src="${weapon.img}" style="border:0px; width: 50px; height:50px;">${weapon.name}</label>`; });
        const types = ["Acid", "Cold", "Fire", "Lightning", "Thunder"];
        const typeContent = types.map(o => `<option value="${o.toLowerCase()}">${o}</option>`);
        const content = `
            <style>
            .weapon .form-group { display: flex; flex-wrap: wrap; width: 100%; align-items: flex-start; }
            .weapon .radio-label { display: flex; flex-direction: column; align-items: center; text-align: center; justify-items: center; flex: 1 0 25%; line-height: normal; }
            .weapon .radio-label input { display: none; }
            .weapon img { border: 0px; width: 50px; height: 50px; flex: 0 0 50px; cursor: pointer; }
            .weapon [type=radio]:checked + img { outline: 2px solid #f00; }
            </style>
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: center;">
                <label>Damage Type: </label>
                <select name="types"}>${typeContent}</select>
            </div>
            <form class="weapon">
            <div class="form-group" id="weapons">
                ${weaponContent}
            </div>
            </form>
        `;
        let dialog = new Promise(async (resolve) => {
            new Dialog({
                title: "Elemental Cleaver: Choose a weapon",
                content,
                buttons: {
                    Confirm: { 
                        label: "Confirm",
                        callback: async () => {
                            resolve({ weaponId: $("input[type='radio'][name='weapon']:checked").val(), type: $("select[name=types]")[0].value });
                        }
                    },
                    Cancel: {
                        label: "Cancel",
                        callback: async () => {
                            resolve(false);
                        },
                    },
                },
                default: "Cancel",
                close: async () => { resolve(false) },
            }).render(true);
        });
        let elementalCleaver = await dialog;
        if (!elementalCleaver) return;
        const weapon = actor.items.find(i => i.id == elementalCleaver.weaponId); 
        const bonus = (actor?.classes?.barbarian?.system?.levels ?? 6) > 13 ? "2" : "1";
        const type = elementalCleaver.type ?? "acid";
        if (weapon.flags["midi-qol"].tempSystem) await weapon.setFlag("midi-qol", "tempSystem", weapon.flags["midi-qol"].tempSystem.concat([{ source: "elementalCleaver", id: lastArg.efData._id, system: { properties: { thr: true }, range: { value: 20, long: 60, units : "ft" } }, damageBonus: [[`${bonus}d6`, type]] }]));
        if (!weapon.flags["midi-qol"].tempSystem) await weapon.setFlag("midi-qol", "tempSystem", [{ source: "core", id: weapon.id, system: JSON.parse(JSON.stringify(weapon.system)) }, { source: "elementalCleaver", id: lastArg.efData._id, system: { properties: { thr: true } , range: { value: 20, long: 60, units : "ft" }}, damageBonus: [[`${bonus}d6`, type]] }]); 
        await weapon.setFlag("midi-qol", "elementalCleaver", lastArg.efData._id);
        await weapon.update({
            name: weapon.name + " (Elemental Cleaver)",
            system: { properties: { thr: true }, range: { value: 20, long: 60, units : "ft" }, "damage.parts": weapon.system.damage.parts.concat([[`${bonus}d6`, type]]), "damage.versatile": weapon.system.damage.versatile ? weapon.system.damage.versatile + "+" + `${bonus}d6[${type}]` : "" }
        });
        await MidiQOL.socket().executeAsGM("updateEffects", { actorUuid: actor.uuid, updates: [{ _id: lastArg.efData._id, changes: lastArg.efData.changes.concat([{ key: "flags.midi-qol.elementalCleaver", mode: 5, value: type, priority: 20 }]) }] });
    } else if (args[0] === "off") { 
        const weapon = actor.items.find(i => i.flags["midi-qol"].elementalCleaver === lastArg.efData._id);
        if (!weapon) weapon = game.actors.contents.find(a => a.items.find(i => i.flags["midi-qol"].elementalCleaver === lastArg.efData._id)).items.find(i => i.flags["midi-qol"].elementalCleaver === lastArg.efData._id);
		await weapon.setFlag("midi-qol", "tempSystem", weapon.flags["midi-qol"].tempSystem.filter(s => s.source !== "elementalCleaver" && s.id !== lastArg.efData._id));
		const tempSystem = JSON.parse(JSON.stringify(weapon.flags["midi-qol"].tempSystem.find(s => s.source === "core").system)); 
		weapon.flags["midi-qol"].tempSystem.filter(s => s.source !== "core").forEach(s => {
            mergeObject(tempSystem, s.system);
            if (s.attackBonus) tempSystem.attackBonus = tempSystem.attackBonus + "+" + s.attackBonus;
            if (s.damageBonus) {
                tempSystem.damage.parts = tempSystem.damage.parts.concat(s.damageBonus);
                if (tempSystem.damage.versatile) s.damageBonus.forEach(p => tempSystem.damage.versatile = tempSystem.damage.versatile + "+" + `${p[0]}` + (p[1] ? `[${p[1]}]` : ""));
            }
            if (s.dieReplace) {
                const parts = tempSystem.damage.parts;
                parts[0][0] = parts[0][0].replace(new RegExp(s.dieReplace[0]), s.dieReplace[1]);
                tempSystem.damage.parts = parts;
                if (tempSystem.damage.versatile) tempSystem.damage.versatile = tempSystem.damage.versatile.replace(new RegExp(s.dieReplace[0]), s.dieReplace[1]);
            }
        });
        const tempProperties = mergeObject({ ada: false, amm: false, fin: false, fir: false, foc: false, hvy: false, lgt: false, lod: false, mgc: false, rch: false, rel: false, ret: false, sil: false, spc: false, thr: false, two: false, ver: false }, tempSystem.properties);
		await weapon.update({ "system.properties": tempProperties });
		await weapon.update({
			name: weapon.name.replace(" (Elemental Cleaver)", ""),
			system: tempSystem
		});
		if (weapon.flags["midi-qol"].tempSystem.length < 2) weapon.unsetFlag("midi-qol", "tempSystem"); 
		weapon.unsetFlag("midi-qol", "elementalCleaver"); 
    } 
} catch (err) {console.error("Elemental Cleaver Macro - ", err);}