try {
	if (args[0].macroPass != "postActiveEffects" || (!args[0].hitTargets.length && MidiQOL.configSettings().autoRollDamage == "always") || !args[0].workflow.handOfHarm) return;
    const effectData = {
        changes: [{ key: "macro.CE", mode: 0, value: "Convenient Effect: Poisoned", priority: 20, }],
        disabled: false,
        origin: args[0].item.uuid,
        name: "Physician's Touch",
        icon: "icons/commodities/flowers/dandelion-pod-blue.webp",
        duration: { rounds: 1, turns: 1, seconds: 7 },
        flags: { dae: { specialDuration: ["turnEndSource", "combatEnd"], stackable: "noneName" } }
    }
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].targets[0].actor.uuid, effects: [effectData] });
} catch (err) {console.error("Physician's Touch Macro - ", err)}