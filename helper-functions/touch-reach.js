try {
    if (args[0].macroPass != "preTargeting" || args[0].item.system.range.units != "touch" || args[0].actor.flags?.["midi-qol"]?.range?.touch <= 0) return
    const effectData = {
        changes: [{ key: `flags.midi-qol.range.${args[0].item.system.actionType}`, mode: 2, value: `${args[0].actor.flags?.["midi-qol"]?.range?.touch}`, priority: 20 }],
        disabled: false,
        name: "Touch Reach",
        icon: "",
        flags: { dae: { specialDuration: ["endCombat", "1Action"] } }
    };
    if (!args[0].actor.effects.find(e => e.name == "Touch Reach")) await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].actor.uuid, effects: [effectData] });
    let effects = args[0].actor.effects.filter(e => e.name == "Touch Reach").map(e => e.id);
    let checkHook = Hooks.on("midi-qol.preTargeting", async () => {
        await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: args[0].actor.uuid, effects: effects });
        Hooks.off("midi-qol.preTargeting", checkHook);
    });
} catch (err) {console.error("Touch Reach Macro - ", err)}