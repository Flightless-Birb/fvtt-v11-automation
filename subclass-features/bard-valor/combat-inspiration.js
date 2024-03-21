try {
    if (args[0].workflow.combatInspiration) {
        return { damageRoll: `${args[0].workflow.combatInspiration}`, flavor: "Combat Inspiration" }
    }
    if (args[0].tag == "OnUse" && args[0].macroPass == "preActiveEffects" && args[0].item.effects.find(e => e.name == "Bardic Inspiration")) {
        const faces = args[0].actor.system.scale?.bard?.inspiration?.faces ?? 6;
        let hook1 = Hooks.on("createActiveEffect", async (effect) => {
            if (effect.name == "Bardic Inspiration" && effect.parent.uuid == args[0].targets[0].actor.uuid && effect.parent.uuid != args[0].actor.uuid) {
                let hook2 = Hooks.on("midi-qol.RollComplete", async (workflowNext) => {
                    if (args[0].uuid == workflowNext.uuid) {
                        const changes = args[0].targets[0].actor.effects.find(e => e.id == effect.id).changes;
                        await MidiQOL.socket().executeAsGM("updateEffects", { actorUuid: args[0].targets[0].actor.uuid, updates: [{ _id: effect.id, changes: changes.concat([{ key: "flags.dnd5e.DamageBonusMacro", mode: 0, value: "Compendium.dnd-5e-core-compendium.macros.3XcaPQ88O8fYyS0V, postDamageRoll", priority: 20 }, { key: "flags.midi-qol.combatInspiration", mode: 5, value: `${faces}`, priority: 20 }, { key: "flags.midi-qol.optional.bi.ac", mode: 5, value: `+1d${faces}`, priority: 20 }]) }] });
                        Hooks.off("midi-qol.RollComplete", hook2);
                    }
                });
                Hooks.off("createActiveEffect", hook1);
            }
        });
    } else if (args[0].tag == "DamageBonus" && ["mwak", "rwak"].includes(args[0].item.system.actionType) && args[0].actor.flags["midi-qol"]?.combatInspiration && !args[0].actor.flags["midi-qol"]?.magicalInspiration) {
        const die = args[0].actor.flags["midi-qol"].combatInspiration;
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
        args[0].workflow.combatInspiration = `${diceMult}d${die}`;
        return { damageRoll: `${diceMult}d${die}`, flavor: "Combat Inspiration" } 
    }
} catch (err) {console.error("Combat Inspiration Macro - ", err)}