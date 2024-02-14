try {
    if (args[0].macroPass == "preTargetDamageApplication" && workflow.damageItem.appliedDamage && (args[0].hitTargets.length || MidiQOL.configSettings().autoRollDamage != "always") && args[0].actor.effects.find(e => e.name.includes("Rage"))) {
        const dc = args[0].actor.flags?.["midi-qol"]?.relentlessRage ?? 10;
        let updateHook = Hooks.on("midi-qol.preTargetDamageApplication", async (tokenNext, damageNext) => {
            if (tokenNext.actor.uuid != args[0].actor.uuid || damageNext.workflow.item.uuid != args[0].item.uuid) return;
            if (damageNext.damageItem.oldHP < 1 || damageNext.damageItem.newHP != 0 || damageNext.damageItem.hpDamage - damageNext.damageItem.oldHP > tokenNext.actor.system.attributes.hp.max) return;
            let dialog = new Promise((resolve) => {
                new Dialog({
                title: "Usage Configuration: Relentless Rage",
                content: `<p>Incoming damage will reduce you to 0 hit points. Use Relentless Rage?</p>`,
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
            if (!useFeat) return;
            const dcEffect = tokenNext.actor.effects.find(e => e.name.includes("Used Relentless Rage"));
            if (dcEffect) {
                await MidiQOL.socket().executeAsGM("updateEffects", { actorUuid: tokenNext.actor.uuid, updates: [{ _id: dcEffect.id, changes: [{ key: "flags.midi-qol.relentlessRage", mode: 5, value: +dc + 5, priority: 20 }] }] });
            } else {
                const effectData = {
                    disabled: false,
                    name: "Used Relentless Rage",
                    icon: "icons/skills/social/intimidation-impressing.webp",
                    flags: { dae: { specialDuration: ["longRest"] } },
                    changes: [{ key: "flags.midi-qol.relentlessRage", mode: 5, value: +dc + 5, priority: 20 }]
                }
                await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tokenNext.actor.uuid, effects: [effectData] });
            }
            const itemData = {
                name: "Relentless Rage",
                img: "icons/skills/social/intimidation-impressing.webp",
                type: "feat",
                system: {
                    activation: { type: "special" },
                    target: { type: "self" },
                    range: { units: "self" },
                    actionType: "save",
                    save: { ability: "con", dc: dc, scaling: "flat" },
                }
            }
            const item = new CONFIG.Item.documentClass(itemData, { parent: args[0].actor });
            const itemWorkflow = await MidiQOL.completeItemUse(item, {}, { showFullCard: true, createWorkflow: true, configureDialog: false });
            if (itemWorkflow.failedSaves.size) return;
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
} catch (err)  {console.error("Relentless Rage Macro - ", err)}

/*
try {
    if (args[0].macroPass == "preTargetDamageApplication" && workflow.damageItem.appliedDamage && (args[0].hitTargets.length || MidiQOL.configSettings().autoRollDamage != "always") && args[0].actor.effects.find(e => e.name.includes("Rage"))) {
        const usesItem = args[0].actor.items.find(i => i.name.includes("Relentless Endurance") && i.system.uses.value);
        if (!usesItem) return;
        const dc = args[0].actor.flags?.["midi-qol"]?.relentlessRage ?? 10;
        let updateHook = Hooks.on("midi-qol.preTargetDamageApplication", async (tokenNext, damageNext) => {
            if (tokenNext.actor.uuid != args[0].actor.uuid || damageNext.workflow.item.uuid != args[0].item.uuid) return;
            if (damageNext.damageItem.oldHP < 1 || damageNext.damageItem.newHP != 0 || damageNext.damageItem.hpDamage - damageNext.damageItem.oldHP > tokenNext.actor.system.attributes.hp.max) return;
            let dialog = new Promise((resolve) => {
                new Dialog({
                title: "Usage Configuration: Relentless Rage",
                content: `<p>Incoming damage will reduce you to 0 hit points. Use Relentless Rage?</p>`,
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
            if (!useFeat) return;
            const dcEffect = tokenNext.actor.effects.find(e => e.name.includes("Used Relentless Rage"));
            if (dcEffect) {
                await MidiQOL.socket().executeAsGM("updateEffects", { actorUuid: tokenNext.actor.uuid, updates: [{ _id: dcEffect.id, changes: [{ key: "flags.midi-qol.relentlessRage", mode: 5, value: +dc + 5, priority: 20 }] }] });
            } else {
                const effectData = {
                    disabled: false,
                    name: "Used Relentless Rage",
                    icon: "icons/skills/social/intimidation-impressing.webp",
                    flags: { dae: { specialDuration: ["longRest"] } },
                    changes: [{ key: "flags.midi-qol.relentlessRage", mode: 5, value: +dc + 5, priority: 20 }]
                }
                await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tokenNext.actor.uuid, effects: [effectData] });
            }
            const itemData = {
                name: "Relentless Rage",
                img: "icons/skills/social/intimidation-impressing.webp",
                type: "feat",
                system: {
                    activation: { type: "special" },
                    target: { type: "self" },
                    range: { units: "self" },
                    actionType: "save",
                    save: { ability: "con", dc: dc, scaling: "flat" },
                }
            }
            const item = new CONFIG.Item.documentClass(itemData, { parent: args[0].actor });
            const itemWorkflow = await MidiQOL.completeItemUse(item, {}, { showFullCard: true, createWorkflow: true, configureDialog: false });
            if (itemWorkflow.failedSaves.size) return;
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
} catch (err)  {console.error("Relentless Rage Macro - ", err)}
*/