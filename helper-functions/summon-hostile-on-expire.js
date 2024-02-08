try {
    if (args[0].tag == "OnUse" && args[0].macroPass == "postActiveEffects" && args[0].item.system.duration.value) {
        const summonId = args[0].item._id + '-' + args[0].itemCardId;
        let seconds = args[0].item.system.duration.value;
        switch (args[0].item.system.duration.units) {
            case "round":
                seconds *= 6;
                break;
            case "minute":
                seconds *= 60;
                break;
            case "hour":
                seconds *= 3600;
                break;
            case "day":
                seconds *= 28800;
                break; 
            default:
                return;
        }
        let hook = Hooks.on("summonComplete", async (summonIdNext, summons) => {
            if (summonId != summonIdNext) return;
            const effectData = {
                disabled: false,
                duration: { seconds: seconds },
                icon: args[0].item.img,
                name: args[0].item.name,
                origin: args[0].item.uuid,
                flags: { "midi-qol": { summonId: summonId, summonIds: summons.tokenIds } },
                changes: [{ key: "macro.execute", mode: 0, value: `Compendium.dnd-5e-core-compendium.macros.J9uaF0zVZfGUnBwO ${summonId}`, priority: "20" }]
            }
            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].actor.uuid, effects: [effectData] });
            Hooks.off("summonComplete", hook);
        });
    } else if (args[0] == "off" && args[args.length - 1].efData.flags["midi-qol"].summonId && args[args.length - 1].efData.flags["midi-qol"].summonIds) {
        const summonIds = canvas.tokens.placeables.filter(t => t.document.flags?.["midi-qol"]?.summonId == args[args.length - 1].efData.flags["midi-qol"].summonId).map(t => t.id);
        summonIds.forEach(async s => {
            const summon = canvas.tokens.get(s);
            summon.document.update({ disposition: -1 });
        });
    }
} catch (err) {console.error("Summon Hostile on Expire Macro - ", err)}