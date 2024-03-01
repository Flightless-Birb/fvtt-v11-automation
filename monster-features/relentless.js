try {
    if (args[0].macroPass == "preTargetDamageApplication" && workflow.damageItem.appliedDamage && (args[0].hitTargets.length || MidiQOL.configSettings().autoRollDamage != "always")) {
        const usesItem = args[0].actor.items.find(i => i.name == "Relentless" && i.system.uses.value);
        if (!usesItem) return;
        let updateHook = Hooks.on("midi-qol.preTargetDamageApplication", async (tokenNext, damageNext) => {
            if (tokenNext.actor.uuid != args[0].actor.uuid || damageNext.workflow.item.uuid != args[0].item.uuid) return;
            if (damageNext.damageItem.oldHP < 1 || damageNext.damageItem.newHP != 0 || damageNext.hpDamage > (args[0].actor.flags?.["midi-qol"]?.relentless ?? 7)) return;
            const itemData = {
                name: "Relentless",
                img: "icons/skills/wounds/blood-cells-vessel-red-orange.webp",
                type: "feat",
                system: {
                    activation: { type: "special" },
                    target: { type: "self" },
                    range: { units: "self" },
                    actionType: "utility",
                }
            }
            const item = new CONFIG.Item.documentClass(itemData, { parent: args[0].actor });
            await MidiQOL.completeItemUse(item, {}, { showFullCard: true, createWorkflow: true, configureDialog: false });
            await usesItem.update({ "system.uses.value": Math.max(0, usesItem.system.uses.value - 1) });
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
} catch (err)  {console.error("Relentless Macro - ", err)}

/*
try {
    if (args[0].macroPass == "preTargetDamageApplication" && workflow.damageItem.appliedDamage && (args[0].hitTargets.length || MidiQOL.configSettings().autoRollDamage != "always")) {
        const usesItem = args[0].actor.items.find(i => i.name == "Relentless" && i.system.uses.value);
        if (!usesItem) return;
        let updateHook = Hooks.on("midi-qol.preTargetDamageApplication", async (tokenNext, damageNext) => {
            if (tokenNext.actor.uuid != args[0].actor.uuid || damageNext.workflow.item.uuid != args[0].item.uuid) return;
            if (damageNext.damageItem.oldHP < 1 || damageNext.damageItem.newHP != 0 || damageNext.hpDamage > (args[0].actor.flags?.["midi-qol"]?.relentless ?? 7)) return;
            const itemData = {
                name: "Relentless",
                img: "icons/skills/wounds/blood-cells-vessel-red-orange.webp",
                type: "feat",
                system: {
                    activation: { type: "special" },
                    target: { type: "self" },
                    range: { units: "self" },
                    actionType: "utility",
                }
            }
            const item = new CONFIG.Item.documentClass(itemData, { parent: args[0].actor });
            await MidiQOL.completeItemUse(item, {}, { showFullCard: true, createWorkflow: true, configureDialog: false });
            await usesItem.update({ "system.uses.value": Math.max(0, usesItem.system.uses.value - 1) });
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
} catch (err)  {console.error("Relentless Macro - ", err)}
*/