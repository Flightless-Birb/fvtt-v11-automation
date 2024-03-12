try {
    if (args[0].macroPass != "postActiveEffects") return;
    const sourceEffect = args[0].actor.effects.find(e => e.name.includes("Twilight Sanctuary"));
    const level = actor?.classes?.cleric?.system?.levels ?? 1;
    const effectData = {
        changes: [{ key: "flags.midi-qol.OverTime", mode: 0, value: "turn=end,label=Twilight Sanctuary,damageRoll=1d6+@classes.cleric.levels,damageType=temphp,removeCondition=false,killAnim=true", priority: 20 }],
        disabled: false,
        origin: args[0].item.uuid,
        name: "Twilight Sanctuary Aura",
        icon: "icons/magic/defensive/barrier-shield-dome-pink.webp",
        duration: { seconds: 60 },
        flags: { dae: { stackable: "noneName" }, ActiveAuras: { aura: "Allies", displayTemp: false, height: true, hidden: true, hostile: false, ignoreSelf: false, isAura: true, nameOverride: "Twilight Sanctuary", onlyOnce: false, radius: 30, wallsBlock: "true", customCheck: "MidiQOL.typeOrRace(actor.uuid)" } }
    }
    if (level > 16) effectData.changes.push({ key: "macro.CE", mode: 0, value: "Cover (Half)", priority: 20 });
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].actor.uuid, effects: [effectData] });
    const effect = args[0].actor.effects.find(e => e.name.includes("Twilight Sanctuary Aura"));
    if (effect && sourceEffect) {
        await MidiQOL.socket().executeAsGM("updateEffects", { actorUuid: args[0].actor.uuid, updates: [{ _id: effect.id, changes: effect.changes.concat([{ key: `flags.dae.deleteUuid`, mode: 5, value: sourceEffect.uuid, priority: 20 }]) }] });
        await MidiQOL.socket().executeAsGM("updateEffects", { actorUuid: args[0].actor.uuid, updates: [{ _id: sourceEffect.id, changes: sourceEffect.changes.concat([{ key: `flags.dae.deleteUuid`, mode: 5, value: effect.uuid, priority: 20 }]) }] });
    }
} catch (err) {console.error("Twilight Sanctuary Macro - ", err)}