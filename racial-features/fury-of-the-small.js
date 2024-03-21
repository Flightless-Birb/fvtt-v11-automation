try {
    const sizes = {
        "tiny": 1,
        "sm": 2,
        "med": 3,
        "lg": 4,
        "huge": 5,
        "grg": 6
    }
    if (args[0].workflow.furyOfTheSmall == "attack") {
        return { damageRoll: `${args[0].actor.system.attributes.prof}`, flavor: "Fury of the Small" }
    }
    if (args[0].tag == "DamageBonus" && (args[0].hitTargets.length || MidiQOL.configSettings().autoRollDamage != "always") && ["mwak", "rwak", "msak", "rsak"].includes(args[0].item.system.actionType) && (!game.combat || game.combat?.current?.tokenId == args[0].tokenId) && (!game.combat || !args[0].actor.effects.find(e => e.name == "Used Fury of the Small" && !e.disabled))) {
        if (sizes[args[0].actor.system.traits.size] >= sizes[args[0].targets[0].actor.system.traits.size]) return;
        const usesItem = args[0].actor.items.find(i => i.name == "Fury of the Small" && i.system.uses.value);
        if (!usesItem) return;
        let dialog = new Promise((resolve) => {
            new Dialog({
            title: "Fury of the Small",
            content: `
            <p>Use Fury of the Small to deal additional damage?</p>
            <p>(${usesItem.system.uses.value} Uses Remaining)</p>
            `,
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
        if (game.combat) {
            const effectData = {
                disabled: false,
                flags: { dae: { specialDuration: ["turnStart", "combatEnd"] } },
                icon: "icons/skills/ranged/arrow-strike-glowing-teal.webp",
                name: "Used Fury of the Small",
            }
            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].actor.uuid, effects: [effectData] });
        }
        await usesItem.update({ "system.uses.value": Math.max(0, usesItem.system.uses.value - 1) });
        args[0].workflow.furyOfTheSmall = "attack";
        return { damageRoll: `${args[0].actor.system.attributes.prof}`, flavor: "Fury of the Small" }
    } else if (args[0].macroPass == "preDamageApplication" && (args[0].hitTargets.length || MidiQOL.configSettings().autoRollDamage != "always") && args[0].damageList && args[0].item.type == "spell" && !["mwak", "rwak", "msak", "rsak"].includes(args[0].item.system.actionType) && !["", "midi-none", "temphp", "healing"].find(d => args[0].item.system.damage.parts[0][1] == d)  && (!game.combat || game.combat?.current?.tokenId == args[0].tokenId) && (!game.combat || !args[0].actor.effects.find(e => e.name == "Used Fury of the Small" && !e.disabled))) {
        let targetContent = "";
        args[0].damageList.forEach((target) => { 
            let targetToken = canvas.tokens.get(target.tokenId);
            if (target.appliedDamage < 1 || !targetToken.actor || !MidiQOL.typeOrRace(targetToken.actor) || sizes[args[0].actor.system.traits.size] >= sizes[targetToken.actor.system.traits.size]) return;
            targetContent += `<label class="radio-label"><input type="radio" name="target" value="${targetToken.id}"><img id="${targetToken.id}" src="${targetToken.texture.src ?? targetToken.document.texture.src}" style="border: 0px; width 50px; height: 50px;"></label>`; 
        });
        if (targetContent == "") return;
        const usesItem = args[0].actor.items.find(i => i.name == "Fury of the Small" && i.system.uses.value);
        const content = `
            <style>
            .target .form-group { display: flex; flex-wrap: wrap; width: 100%; align-items: flex-start; }
            .target .radio-label { display: flex; flex-direction: column; align-items: center; text-align: center; justify-items: center; flex: 1 0 25%; line-height: normal; }
            .target .radio-label input { display: none; }
            .target img { border: 0px; width: 50px; height: 50px; flex: 0 0 50px; cursor: pointer; }
            .target [type=radio]:checked + img { outline: 2px solid #f00; }
            </style>
            <div style="display: flex; flex-direction: row; align-items: center; text-align: center; justify-content: center;">
                <p>Choose a target to deal additional damage to:</p>
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
                title: "Fury of the Small",
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
        if (game.combat) {
            const effectData = {
                disabled: false,
                flags: { dae: { specialDuration: ["turnStart", "combatEnd"] } },
                icon: "icons/commodities/biological/wing-bird-white.webp",
                name: "Used Fury of the Small",
            }
            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].actor.uuid, effects: [effectData] });
        }
        await usesItem.update({ "system.uses.value": Math.max(0, usesItem.system.uses.value - 1) });
        let target = canvas.tokens.get(targetId);
        let targetDamage = args[0].workflow.damageList.find(d => d.tokenId = targetId);
        let damageBonus = { damage: args[0].actor.system.attributes.prof, type: args[0].workflow.newDefaultDamageType ?? args[0].workflow.defaultDamageType };
        if (target.actor.system.traits.di.value.has(damageBonus.type)) damageBonus.damage = 0;
        if (target.actor.system.traits.dr.value.has(damageBonus.type)) damageBonus.damage = Math.floor(damageBonus.damage / 2);
        if (target.actor.system.traits.dv.value.has(damageBonus.type)) damageBonus.damage = Math.floor(damageBonus.damage * 2);
        targetDamage.damageDetail[0].push(damageBonus);
        targetDamage.totalDamage += damageBonus.damage;
        targetDamage.appliedDamage += damageBonus.damage;
        targetDamage.tempDamage = Math.max(0, Math.min(targetDamage.oldTempHP, targetDamage.appliedDamage - targetDamage.hpDamage));
        targetDamage.newTempHP = targetDamage.oldTempHP - targetDamage.tempDamage;
        targetDamage.hpDamage = Math.max(0, Math.min(targetDamage.oldHP, targetDamage.appliedDamage - targetDamage.tempDamage));
        targetDamage.newHP = targetDamage.oldHP - targetDamage.hpDamage;
        args[0].workflow.furyOfTheSmall = "spell";
    }
} catch (err) {console.error("Fury of the Small Macro - ", err)}