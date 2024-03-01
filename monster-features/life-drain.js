try {
	if (args[0].macroPass != "postActiveEffects" || (!args[0].hitTargets.length && MidiQOL.configSettings().autoRollDamage == "always") || !args[0].failedSaves.length || args[0].targets[0].actor.system.traits.ci.custom.toLowerCase().includes("hit point maximum reduction")) return;
    args[0].damageList.forEach(async (d) => {
        if (!d.hpDamage || d.hpDamage < 1) return;
        const effectData = {
            changes: [{ key: "system.attributes.hp.max", mode: 2, value: `-${d.hpDamage}`, priority: 20, }],
            disabled: false,
            origin: args[0].item.uuid,
            name: "Life Drain",
            icon: "icons/magic/unholy/strike-hand-glow-pink.webp",
            flags: { dae: { specialDuration: ["longRest"], stackable: "multi" } }
        }
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: d.actorUuid, effects: [effectData] });
    });
} catch (err) {console.error("Life Drain Macro - ", err)}