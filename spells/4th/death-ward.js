try {
    if (args[0].macroPass == "preTargetDamageApplication" && workflow.damageItem.appliedDamage && (args[0].hitTargets.length || MidiQOL.configSettings().autoRollDamage != "always")) {
        let updateHook = Hooks.on("midi-qol.preTargetDamageApplication", async (tokenNext, damageNext) => {
            if (tokenNext.actor.uuid != args[0].actor.uuid || damageNext.workflow.item.uuid != args[0].item.uuid) return;
            if (damageNext.damageItem.oldHP < 1 || damageNext.damageItem.newHP != 0) return;
            await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: args[0].actor.uuid, effects: actor.effects.filter(e => e.name == "Death Ward").map(e => e.id) });
            ChatMessage.create({ content: "Death Ward activates, causing the target to drop to 1 hit point instead of 0" });
            damageNext.damageItem.newHP = 1;
            damageNext.damageItem.hpDamage = damageNext.damageItem.oldHP - damageNext.damageItem.newHP;
            Hooks.off("midi-qol.preTargetDamageApplication", updateHook);
            Hooks.off("midi-qol.RollComplete", abortHook);
        });
        let abortHook = Hooks.on("midi-qol.RollComplete", async (workflowNext) => {
            if (workflowNext.item.uuid != args[0].item.uuid) return;
            Hooks.off("midi-qol.preTargetDamageApplication", updateHook);
            Hooks.off("midi-qol.RollComplete", abortHook);
        });
    }
} catch (err)  {console.error("Death Ward Macro - ", err)}

/*
try {
    if (args[0].macroPass == "preTargetDamageApplication" && workflow.damageItem.appliedDamage && (args[0].hitTargets.length || MidiQOL.configSettings().autoRollDamage != "always")) {
        let updateHook = Hooks.on("midi-qol.preTargetDamageApplication", async (tokenNext, damageNext) => {
            if (tokenNext.actor.uuid != args[0].actor.uuid || damageNext.workflow.item.uuid != args[0].item.uuid) return;
            if (damageNext.damageItem.oldHP < 1 || damageNext.damageItem.newHP != 0) return;
            await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: args[0].actor.uuid, effects: actor.effects.filter(e => e.name == "Death Ward").map(e => e.id) });
            ChatMessage.create({ content: "Death Ward activates, causing the target to drop to 1 hit point instead of 0" });
            let hpUpdateHook = Hooks.on("preUpdateActor", async (actor, changes, options) => {
                if (actor.uuid != args[0].actor.uuid) return;
                if (changes.system.attributes.hp.value < 1) changes.system.attributes.hp.value = 1;
                Hooks.off("preUpdateActor", hpUpdateHook);
                Hooks.off("midi-qol.RollComplete", hpAbortHook);
            });
            let hpAbortHook = Hooks.on("midi-qol.RollComplete", async (workflowNext) => {
                if (workflowNext.item.uuid != args[0].item.uuid) return;
                Hooks.off("preUpdateActor", hpUpdateHook);
                Hooks.off("midi-qol.RollComplete", hpAbortHook);
            });
            Hooks.off("midi-qol.preTargetDamageApplication", updateHook);
            Hooks.off("midi-qol.RollComplete", abortHook);
        });
        let abortHook = Hooks.on("midi-qol.RollComplete", async (workflowNext) => {
            if (workflowNext.item.uuid != args[0].item.uuid) return;
            Hooks.off("midi-qol.preTargetDamageApplication", updateHook);
            Hooks.off("midi-qol.RollComplete", abortHook);
        });
    }
} catch (err)  {console.error("Undead Fortitude Macro - ", err)}
*/