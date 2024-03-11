try {
    if (args[0].macroPass != "postActiveEffects") return;
    args[0].failedSaves.forEach(async t => {
        if (!t.actor) return;
        const effectData = {
            name: "Prone",
            changes: [{ key: "StatusEffect", mode: 0, value: "Convenient Effect: Prone", priority: 20 }],
            disabled: false,
            isSuppressed: false,
        }
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: t.actor.uuid, effects: [effectData] });
    });
} catch (err)  {console.error("Hideous Laughter Macro - ", err)}