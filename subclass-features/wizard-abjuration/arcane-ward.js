try {
    if (args[0].macroPass == "postActiveEffects" && args[0].item.type == "spell" && args[0].item.system.school == "abj" && args[0].item.system.level > 0 && args[0].spellLevel > 0) {
        const usesItem = args[0].actor.items.find(i => i.name.includes("Arcane Ward") && i.system.uses);
        if (!usesItem) return;
        const usesEffect = args[0].actor.effects.find(e => e.name.includes("Used Arcane Ward"));
        if (usesEffect) {
            await usesItem.update({ "system.uses.value": Math.min(usesItem.system.uses.max, usesItem.system.uses.value + args[0].spellLevel) });
        } else {
            await usesItem.update({ "system.uses.value": usesItem.system.uses.max });
            const effectData = {
                disabled: false,
                name: "Used Arcane Ward",
                icon: "icons/magic/defensive/shield-barrier-flaming-diamond-purple-orange.webp",
                flags: { dae: { specialDuration: ["longRest"] } }
            }
            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].actor.uuid, effects: [effectData] });
        }
    } else if (args[0].macroPass == "preTargetDamageApplication" && workflow.damageItem.appliedDamage && (args[0].hitTargets.length || MidiQOL.configSettings().autoRollDamage != "always")) {
        const usesItem = args[0].actor.items.find(i => i.name.includes("Arcane Ward") && i.system.uses.value);
        if (!usesItem) return;
        const dr = Math.min(usesItem.system.uses.value, workflow.damageItem.appliedDamage);
        // applied damage recalc
        workflow.damageItem.appliedDamage = Math.max(0, workflow.damageItem.appliedDamage - dr);
        // hp damage recalc
        workflow.damageItem.hpDamage = Math.max(0, Math.min(workflow.damageItem.oldHP, workflow.damageItem.appliedDamage - workflow.damageItem.tempDamage));
        workflow.damageItem.newHP = workflow.damageItem.oldHP - workflow.damageItem.hpDamage;
        // temp hp damage recalc
        workflow.damageItem.tempDamage = Math.max(0, Math.min(workflow.damageItem.oldTempHP, workflow.damageItem.appliedDamage - workflow.damageItem.hpDamage));
        workflow.damageItem.newTempHP = workflow.damageItem.oldTempHP - workflow.damageItem.tempDamage;
        ChatMessage.create({ content: `Arcane Ward: ${dr} Damage Negated.` });
        await usesItem.update({ "system.uses.value": Math.max(0, usesItem.system.uses.value - dr) });
    }
} catch (err)  {console.error("Arcane Ward Macro - ", err)}