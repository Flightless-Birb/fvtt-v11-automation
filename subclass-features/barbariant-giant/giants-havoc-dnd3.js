try {
    if (args[0].tag == "DamageBonus" && ["mwak", "rwak"].includes(args[0].item.system.actionType) && (args[0].item.system.ability == "str" || (!args[0].item.system.ability && args[0].actor.system.abilities.str.mod > args[0].actor.system.abilities.dex.mod)) && args[0].item.system.properties.includes("thr") && (args[0].item.system.actionType == "rwak" || 5 * Math.floor(MidiQOL.computeDistance(args[0].workflow.token, args[0].targets[0], false) / 5) > (args[0].item.system.properties.includes("rch") ? 10 : 5) + (args[0].actor.flags?.["midi-qol"]?.range?.mwak ?? 0))) {
        const damage = args[0].actor.system.scale?.barbarian?.rage ?? 2;
        return { damageRoll: `${damage}`, flavor: "Giants Havoc" }
    } else if (args[0].macroPass == "preActiveEffects" && args[0].item.effects.find(e => e.name == "Rage")) {
        let level  = actor?.classes?.barbarian?.system?.levels ?? 3;
        let size = actor.system.traits.size;
        let range = level > 13 ? 15 : 5;
        let dialog = size == "grg" ? false : size == "huge" ? "huge" : level < 14 || size == "lg" ? "lg" : new Promise((resolve) => {
            new Dialog({
            title: "Usage Configuration: Giant's Havoc",
            content: `<p>Become Large or Huge in size?</p>`,
            buttons: {
                confirm: {
                    label: "Large",
                    callback: () => resolve("lg")
                },
                cancel: {
                    label: "Huge",
                    callback: () => {resolve("huge")}
                }
            },
            default: "cancel",
            close: () => {resolve(false)}
            }).render(true);
        });
        let condition = await dialog;
        if (!condition) return;
        const sizeMults = {
            huge: 3,
            lg: 2
        }
        let createHook = Hooks.on("createActiveEffect", async (effect) => {
            if (effect.name == "Rage" && effect.parent.uuid == args[0].actor.uuid) {
                let effectHook = Hooks.on("midi-qol.RollComplete", async (workflowNext) => {
                    if (args[0].uuid == workflowNext.uuid) {
                        const changes = args[0].actor.effects.find(e => e.id == effect.id).changes;
                        await MidiQOL.socket().executeAsGM("updateEffects", { actorUuid: args[0].actor.uuid, updates: [{ _id: effect.id, changes: changes.concat([{ key: "system.traits.size", mode: 5, value: condition, priority: 20 }, { key: "ATL.height", mode: 5, value: sizeMults[condition], priority: 20 }, { key: "ATL.width", mode: 5, value: sizeMults[condition], priority: 20 }, { key: "flags.midi-qol.range.mwak", mode: 2, value: range, priority: 20 }, { key: "flags.midi-qol.range.msak", mode: 2, value: range, priority: 20 }, { key: "flags.dnd5e.DamageBonusMacro", mode: 0, value: "Compendium.dnd-5e-core-compendium.macros.Phk3GPpQEHzLITeo", priority: 20 }]) }] });
                        Hooks.off("midi-qol.RollComplete", effectHook);
                    }
                });
                Hooks.off("createActiveEffect", createHook);
            }
        });
    }
} catch (err) {console.error("Giant's Havoc Macro - ", err)}