try {
    if (args[0].workflow.celestialRevelation == "attack") {
        let damageType = args[0].actor.flags["midi-qol"]?.celestialRevelation ? args[0].actor.flags["midi-qol"]?.celestialRevelation : "radiant";
        return { damageRoll: `${args[0].actor.system.attributes.prof}`, damageType: damageType, flavor: "Celestial Revelation" }
    }
    if (args[0].tag == "DamageBonus" && (args[0].hitTargets.length || MidiQOL.configSettings().autoRollDamage != "always") && ["mwak", "rwak", "msak", "rsak"].includes(args[0].item.system.actionType) && (!game.combat || game.combat?.current?.tokenId == args[0].tokenId) && (!game.combat || !args[0].actor.effects.find(e => e.name == "Used Celestial Revelation" && !e.disabled))) {
        let useFeat = true;
        if (game.combat) {
            let dialog = new Promise((resolve) => {
                new Dialog({
                title: "Celestial Revelation",
                content: `<p>Use Celestial Revelation to deal additional damage?</p>`,
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
            useFeat = await dialog;
        }
        if (!useFeat) return;
        if (game.combat) {
            const effectData = {
                disabled: false,
                flags: { dae: { specialDuration: ["turnStart", "combatEnd"] } },
                icon: "icons/commodities/biological/wing-bird-white.webp",
                name: "Used Celestial Revelation",
            }
            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].actor.uuid, effects: [effectData] });
        }
        let damageType = args[0].actor.flags["midi-qol"]?.celestialRevelation ? args[0].actor.flags["midi-qol"]?.celestialRevelation : "radiant";
        args[0].workflow.celestialRevelation = "attack";
        return { damageRoll: `${args[0].actor.system.attributes.prof}`, damageType: damageType, flavor: "Celestial Revelation" }
    } else if (args[0].macroPass == "preDamageApplication" && (args[0].hitTargets.length || MidiQOL.configSettings().autoRollDamage != "always") && args[0].damageList && args[0].item.type == "spell" && !["mwak", "rwak", "msak", "rsak"].includes(args[0].item.system.actionType) && !["", "midi-none", "temphp", "healing"].find(d => args[0].item.system.damage.parts[0][1] == d) && (!game.combat || game.combat?.current?.tokenId == args[0].tokenId) && (!game.combat || !args[0].actor.effects.find(e => e.name == "Used Celestial Revelation" && !e.disabled))) {
        let targetContent = "";
        args[0].damageList.forEach((target) => { 
            let targetToken = canvas.tokens.get(target.tokenId);
            if (target.appliedDamage < 1 || !targetToken.actor || !MidiQOL.typeOrRace(targetToken.actor)) return;
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
                title: "Celestial Revelation",
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
                name: "Used Celestial Revelation",
            }
            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].actor.uuid, effects: [effectData] });
        }
        let target = canvas.tokens.get(targetId);
        let targetDamage = args[0].workflow.damageList.find(d => d.tokenId = targetId);
        let damageBonus = { damage: args[0].actor.system.attributes.prof, type: `radiant` };
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
        args[0].workflow.celestialRevelation = "spell";
    }
} catch (err) {console.error("Celestial Revelation Macro - ", err)}