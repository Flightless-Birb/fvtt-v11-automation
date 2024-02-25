try {
    if (args[0].macroPass != "postActiveEffects" || !args[0].actor.flags?.["midi-qol"]?.chromaticAncestry) return
    const effectData = {
        changes: [{ key: "system.traits.di.value", mode: 2, value: args[0].actor.flags?.["midi-qol"]?.chromaticAncestry, priority: 20 }],
        disabled: false,
        name: "Chromatic Warding",
        icon: args[0].item.img,
        duration: { seconds: 60 }
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].targets[0].actor.uuid, effects: [effectData] });
} catch (err)  {console.error("Chromatic Warding Macro - ", err)}