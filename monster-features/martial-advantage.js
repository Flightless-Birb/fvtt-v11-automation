try {
    if (args[0].workflow.martialAdvantage) {
        const dice = +args[0].actor.flags["midi-qol"].martialAdvantage ?? 1;
        const diceMult = args[0].isCritical ? 2 : 1;
        return { damageRoll: `${dice * diceMult}d6`, flavor: "Martial Advantage" }
    }
    if (args[0].tag != "DamageBonus" || (!args[0].hitTargets.length && MidiQOL.configSettings().autoRollDamage == "always") || !["mwak", "rwak"].includes(args[0].item.system.actionType) || (game.combat && args[0].actor.effects.find(e => e.name == "Used Martial Advantage")) || !canvas.tokens.placeables.find(t=> t.actor && MidiQOL.typeOrRace(t.actor) && t.id != args[0].workflow.token.id && t.id != args[0].targets[0].id && t.disposition == args[0].workflow.token.disposition && t.actor.system.attributes?.hp.value > 0 && !MidiQOL.checkIncapacitated(t.actor) && MidiQOL.computeDistance(t, args[0].targets[0], false) < 10)) return;
    if (game.combat) {
        const effectData = {
            disabled: false,
            duration: { turns: 1 },
            name: "Used Martial Advantage",
        }
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].actor.uuid, effects: [effectData] });
    }
    const dice = +args[0].actor.flags["midi-qol"].martialAdvantage ?? 1;
    const diceMult = args[0].isCritical ? 2 : 1;
    args[0].workflow.martialAdvantage = true;
    return { damageRoll: `${dice * diceMult}d6`, flavor: "Martial Advantage" }
} catch (err) {console.error("Martial Advantage Macro - ", err)}