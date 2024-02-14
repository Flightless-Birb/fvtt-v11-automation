try {
    if (args[0].tag == "OnUse" && args[0].macroPass == "preActiveEffects" && args[0].item.effects.find(e => e.name == "Bardic Inspiration")) {
        const faces = args[0].actor.system.scale?.bard?.inspiration?.faces ?? 6;
        let hook1 = Hooks.on("createActiveEffect", async (effect) => {
            if (effect.name == "Bardic Inspiration" && effect.parent.uuid == args[0].targets[0].actor.uuid && effect.parent.uuid != args[0].actor.uuid) {
                let hook2 = Hooks.on("midi-qol.RollComplete", async (workflowNext) => {
                    if (args[0].item.uuid == workflowNext.item.uuid) {
                        await MidiQOL.socket().executeAsGM("updateEffects", { actorUuid: args[0].targets[0].actor.uuid, updates: [{ _id: effect.id, changes: [{ key: "flags.midi-qol.onUseMacroName", mode: 0, value: "Compendium.dnd-5e-core-compendium.macros.ew9sW9jDOLwiQe33, postAttackRoll", priority: 20 }, { key: "flags.midi-qol.onUseMacroName", mode: 0, value: "Compendium.dnd-5e-core-compendium.macros.ew9sW9jDOLwiQe33, isSaveSuccess", priority: 20 }, { key: "flags.midi-qol.optional.bi.attack.all", mode: 5, value: `+1d${faces}[Unflinching Inspiration]`, priority: 20 }, { key: "flags.midi-qol.optional.bi.save.all", mode: 5, value: `+1d${faces}[Unflinching Inspiration]`, priority: 20 }, { key: "flags.midi-qol.optional.skill.all", mode: 5, value: `+1d${faces}[Unflinching Inspiration]`, priority: 20 }, { key: "flags.midi-qol.optional.bi.ability.all", mode: 5, value: `+1d${faces}[Unflinching Inspiration]`, priority: 20 }, { key: "flags.midi-qol.optional.bi.label", mode: 5, value: "Bardic Inspiration", priority: 20 }, { key: "flags.midi-qol.optional.bi.count", mode: 5, value: "every", priority: 20 }] }] });
                        Hooks.off("midi-qol.RollComplete", hook2);
                    }
                });
                Hooks.off("createActiveEffect", hook1);
            }
        });
    } else if (args[0].macroPass == "postAttackRoll" && (args[0].hitTargets.length || MidiQOL.configSettings().autoRollDamage != "always") && args[0]?.workflow?.attackRoll?.terms?.find(t => t.flavor == "Unflinching Inspiration")) {
        const effects = args[0].actor.effects.filter(e => e.name == "Bardic Inspiration").map(e => e.id);
        if (effects) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: args[0].actor.uuid, effects: effects });
    } else if (args[0].macroPass == "isSaveSuccess") {
        let hook = Hooks.on("midi-qol.postCheckSaves", async (workflowNext) => {
            if (args[0].item.uuid == workflowNext.item.uuid && workflowNext?.saveDisplayData?.find(s => s?.target?.actor.uuid == args[0].options.actor.uuid && s?.rollDetail?.terms?.find(t => t.flavor == "Unflinching Inspiration"))) {
                const effects = args[0].options.actor.effects.filter(e => e.name == "Bardic Inspiration").map(e => e.id);
                if (effects) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: args[0].options.actor.uuid, effects: effects });
                Hooks.off("midi-qol.postCheckSaves", hook);
            }
        });
    }
} catch (err) {console.error("Unflinching Inspiration Macro - ", err)}