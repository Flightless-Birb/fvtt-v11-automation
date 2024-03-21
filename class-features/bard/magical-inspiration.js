try {
    if (args[0].workflow.magicaInspiration && args[0].workflow.magicaInspiration != "other") {
        return { damageRoll: `${args[0].workflow.magicaInspiration}`, flavor: "Combat Inspiration" }
    }
    if (args[0].tag == "OnUse" && args[0].macroPass == "preActiveEffects" && args[0].item.effects.find(e => e.name == "Bardic Inspiration")) {
        const faces = args[0].actor.system.scale?.bard?.inspiration?.faces ?? 6;
        let hook1 = Hooks.on("createActiveEffect", async (effect) => {
            if (effect.name == "Bardic Inspiration" && effect.parent.uuid == args[0].targets[0].actor.uuid && effect.parent.uuid != args[0].actor.uuid) {
                let hook2 = Hooks.on("midi-qol.RollComplete", async (workflowNext) => {
                    if (args[0].uuid == workflowNext.uuid) {
                        const changes = args[0].targets[0].actor.effects.find(e => e.id == effect.id).changes;
                        await MidiQOL.socket().executeAsGM("updateEffects", { actorUuid: args[0].targets[0].actor.uuid, updates: [{ _id: effect.id, changes: changes.concat([{ key: "flags.dnd5e.DamageBonusMacro", mode: 0, value: "Compendium.dnd-5e-core-compendium.macros.HRTnaLYVOFTxTCwj", priority: 20 }, { key: "flags.midi-qol.onUseMacroName", mode: 0, value: "Compendium.dnd-5e-core-compendium.macros.HRTnaLYVOFTxTCwj, preDamageApplication", priority: 20 }, { key: "flags.midi-qol.magicalInspiration", mode: 5, value: `${faces}`, priority: 20 }]) }] });
                        Hooks.off("midi-qol.RollComplete", hook2);
                    }
                });
                Hooks.off("createActiveEffect", hook1);
            }
        });
    } else if (args[0].tag == "DamageBonus" && ["mwak", "rwak", "msak", "rsak"].includes(args[0].item.system.actionType) && args[0].actor.flags["midi-qol"]?.magicalInspiration) {
        const die = args[0].actor.flags["midi-qol"].magicalInspiration;
        let dialog = new Promise((resolve) => {
            new Dialog({
            title: "Bardic Inspiration",
            content: `<p>Use Bardic Inspiration to deal 1d${die} additional damage?</p>`,
            buttons: {
                confirm: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Confirm",
                    callback: () => resolve(true)
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
        let useFeat = await dialog;
        if (!useFeat) return;
        let diceMult = args[0].isCritical ? 2 : 1;
        const effects = args[0].actor.effects.filter(e => e.name == "Bardic Inspiration").map(e => e.id);
        if (effects) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: args[0].actor.uuid, effects: effects });
        args[0].workflow.magicalInspiration = `${diceMult}d${die}`;
        return { damageRoll: `${diceMult}d${die}`, flavor: "Magical Inspiration" } 
    } else if (args[0].macroPass == "preDamageApplication" && (args[0].hitTargets.length || MidiQOL.configSettings().autoRollDamage != "always") && args[0].damageList && !["mwak", "rwak", "msak", "rsak"].includes(args[0].item.system.actionType) && !["", "midi-none", "temphp"].find(d => args[0].item.system.damage.parts[0][1] == d) && args[0].actor.flags["midi-qol"]?.magicalInspiration) {
        const die = args[0].actor.flags["midi-qol"].magicalInspiration;
        let targetContent = "";
        args[0].damageList.forEach((target) => { 
            let targetToken = canvas.tokens.get(target.tokenId);
            if ((args[0].workflow.defaultDamageType != "healing" && target.appliedDamage < 1) || (args[0].workflow.defaultDamageType == "healing" && target.appliedDamage > -1) || !targetToken.actor || !MidiQOL.typeOrRace(targetToken.actor)) return;
            targetContent += `<label class="radio-label"><input type="radio" name="target" value="${targetToken.id}"><img id="${targetToken.id}" src="${targetToken.texture.src ?? targetToken.document.texture.src}" style="border: 0px; width 50px; height: 50px;"></label>`; 
        });
        if (targetContent == "") return;
        const content = `
            <style>
            .target .form-group { display: flex; flex-wrap: wrap; width: 100%; align-items: flex-start; }
            .target .radio-label { display: flex; flex-direction: column; align-items: center; text-align: center; justify-items: center; flex: 1 0 25%; line-height: normal; }
            .target .radio-label input { display: none; }
            .target img { border: 0px; width: 50px; height: 50px; flex: 0 0 50px; cursor: pointer; }
            .target [type=radio]:checked + img { outline: 2px solid #f00; }
            </style>
            <div style="display: flex; flex-direction: row; align-items: center; text-align: center; justify-content: center;">
                <p>Choose a target to deal 1d${die} additional ${args[0].workflow.defaultDamageType == "healing" ? "healing" : "damage"} to:</p>
            </div>
            <form class="target">
            <div class="form-group" id="targets">
                ${targetContent}
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
        `;
        let dialog = await new Promise((resolve) => {
            new Dialog({
                title: "Magical Inspiration",
                content: content,
                buttons: {
                    Confirm: { 
                        icon: '<i class="fas fa-check"></i>',
                        label: "Confirm",
                        callback: () => {resolve($("input[type='radio'][name='target']:checked").val())}
                    },
                    Cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel",
                        callback: () => {resolve(false)}
                    }
                },
                close: () => {resolve(false)}
            }).render(true);
        });
        let targetId = await dialog;
        if (!targetId) return;
        let target = canvas.tokens.get(targetId);
        let targetDamage = args[0].workflow.damageList.find(d => d.tokenId = targetId);
        let roll = await new Roll(`1d${die}`).evaluate({async: true});
        if (game.dice3d) game.dice3d.showForRoll(roll);
        let damageBonus = { damage: roll.total, type: args[0].workflow.newDefaultDamageType ?? args[0].workflow.defaultDamageType };
        if (target.actor.system.traits.di.value.has(damageBonus.type)) damageBonus.damage = 0;
        if (target.actor.system.traits.dr.value.has(damageBonus.type)) damageBonus.damage = Math.floor(damageBonus.damage / 2);
        if (target.actor.system.traits.dv.value.has(damageBonus.type)) damageBonus.damage = Math.floor(damageBonus.damage * 2);
        targetDamage.damageDetail[0].push(damageBonus);
        targetDamage.totalDamage += damageBonus.damage;
        targetDamage.appliedDamage = args[0].workflow.defaultDamageType == "healing" ? targetDamage.appliedDamage - damageBonus.damage : targetDamage.appliedDamage + damageBonus.damage;
        targetDamage.tempDamage = args[0].workflow.defaultDamageType == "healing" ? 0 : Math.max(0, Math.min(targetDamage.oldTempHP, targetDamage.appliedDamage - targetDamage.hpDamage));
        targetDamage.newTempHP = targetDamage.oldTempHP - targetDamage.tempDamage;
        targetDamage.hpDamage = args[0].workflow.defaultDamageType == "healing" ? targetDamage.hpDamage - damageBonus.damage : Math.max(0, Math.min(targetDamage.oldHP, targetDamage.appliedDamage - targetDamage.tempDamage));
        targetDamage.newHP = targetDamage.oldHP - targetDamage.hpDamage;
        const effects = args[0].actor.effects.filter(e => e.name == "Bardic Inspiration").map(e => e.id);
        if (effects) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: args[0].actor.uuid, effects: effects });
        args[0].workflow.magicalInspiration = "other";
    }
} catch (err) {console.error("Magical Inspiration Macro - ", err)}